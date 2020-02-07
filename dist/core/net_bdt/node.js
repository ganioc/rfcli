"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const net_1 = require("../net");
const connection_1 = require("./connection");
const { P2P, Util, DHTAPPID } = require('bdt-p2p');
class BdtNode extends net_1.INode {
    // 初始化传入tcp port和udp port，传入0就不监听对应协议
    // @param options { 
    //              logger.level ['off', 'all', 'debug', 'info', 'trace', 'warn']
    // }
    constructor(options) {
        super(options);
        // vport 只是提供给bdt connect的一个抽象，可以不用在调用时传入
        // 先定死， bdt connect 和 listen都先用这个
        this.m_vport = 3000;
        this.m_skipList = [];
        this.m_tcpListenPort = options.tcpport;
        this.m_udpListenPort = options.udpport;
        this.m_host = options.host;
        this.m_options = Object.create(null);
        Object.assign(this.m_options, options);
        this.m_skipList.push(options.peerid);
        this.m_skipList.push(this.m_options.snPeer.peerid);
        this.m_bdtStack = undefined;
    }
    async init() {
        if (this.m_bdtStack) {
            return;
        }
        // bdt 的log控制参数
        P2P.debug({
            level: this.m_options.bdtLoggerOptions.level,
            file_dir: this.m_options.bdtLoggerOptions.file_dir,
            file_name: this.m_options.bdtLoggerOptions.file_name,
        });
        // 初始化 bdt
        await this.createBDTStack();
    }
    async createBDTStack() {
        // let randomPort = DHTUtil.RandomGenerator.integer(65525, 2048);
        // bdt 里0.0.0.0 只能找到公网ip, 这样会导致单机多进程或单机单进程的节点找不到对方
        // 为了方便测试， 补充加入本机的内网192 IP
        // 从配置文件里读取初始的DHT表
        let ips = Util.NetHelper.getLocalIPV4().filter((ip) => ip.match(/^192.168.\d+.\d+/));
        let addrList = [this.m_host, ...ips];
        let dhtEntry = [this.m_options.snPeer];
        if (this.m_options.initDHTEntry) {
            dhtEntry = dhtEntry.concat(this.m_options.initDHTEntry);
        }
        let bdtInitParams = {};
        bdtInitParams['peerid'] = this.m_peerid;
        if (this.m_tcpListenPort !== 0) {
            bdtInitParams['tcp'] = {
                addrList,
                initPort: this.m_tcpListenPort,
                maxPortOffset: 0,
            };
        }
        if (this.m_udpListenPort !== 0) {
            bdtInitParams['udp'] = {
                addrList,
                initPort: this.m_udpListenPort,
                maxPortOffset: 0,
            };
        }
        // 增加指定地址
        // 部分机器会因为监听'0.0.0.0'相同端口，监听本地IP时发生冲突，最终漏掉本地地址，导致同局域网地址连接不上
        let listenerEPList = [];
        addrList.forEach((host) => {
            listenerEPList.push(Util.EndPoint.toString({ address: host, port: this.m_tcpListenPort, family: Util.EndPoint.FAMILY.IPv4, protocol: Util.EndPoint.PROTOCOL.tcp }));
            listenerEPList.push(Util.EndPoint.toString({ address: host, port: this.m_udpListenPort, family: Util.EndPoint.FAMILY.IPv4, protocol: Util.EndPoint.PROTOCOL.udp }));
        });
        bdtInitParams['listenerEPList'] = listenerEPList;
        let { result, p2p } = await P2P.create(bdtInitParams);
        if (result !== 0) {
            throw Error(`init p2p peer error ${result}. please check the params`);
        }
        // 加入区块链应用DHT网络，并做为默认DHT网络，准备妥当再正式提供服务
        p2p.joinDHT(dhtEntry, { manualActiveLocalPeer: true, dhtAppID: this.m_options.dhtAppID, asDefault: true });
        this.m_logger.info(`bdt add network use id ${this.m_options.dhtAppID}`);
        // 加入SN的DHT网络，用于通信穿透，但不参与SN服务
        p2p.joinDHT(dhtEntry, { manualActiveLocalPeer: true, dhtAppID: DHTAPPID.sn });
        result = await p2p.startupBDTStack(bdtInitParams.options);
        if (result !== 0) {
            throw Error(`init p2p peer error ${result}. please check the params`);
        }
        this.m_dht = p2p.dht;
        this.m_bdtStack = p2p.bdtStack;
    }
    _ready() {
        this.m_dht.rootDHT.activeLocalPeer();
    }
    async randomPeers(count, excludes) {
        // 过滤掉自己和种子peer
        const filter = (peer) => {
            if (!peer.peerid) {
                // this.m_logger.debug(`exclude undefined peerid, ${JSON.stringify(peer)}`);
                return false;
            }
            if (this.m_skipList.includes(peer.peerid)) {
                // this.m_logger.debug(`exclude ${peer.peerid} from skipList`);
                return false;
            }
            if (excludes.includes(peer.peerid)) {
                // this.m_logger.debug(`exclude ${peer.peerid} from excludesList`);
                return false;
            }
            return true;
        };
        let res = await this.m_dht.getRandomPeers(count, false, { filter });
        // this.m_logger.info(`first find ${res.peerlist.length} peers, ${JSON.stringify(res.peerlist.map((value: any) => value.peerid))}`);
        const ignore0 = !res || !res.peerlist || res.peerlist.length === 0;
        const peers = (res && res.peerlist) ? res.peerlist : [];
        let peerids = peers.map((value) => value.peerid);
        // this.m_logger.info(`find ${peerids.length} peers after filter, count ${count}, ${JSON.stringify(peerids)}`);
        // 如果peer数量比传入的count多， 需要随机截取
        if (peerids.length > count) {
            let temp_peerids = [];
            for (let i = 0; i < count - 1; i++) {
                let idx = Math.floor(Math.random() * peerids.length);
                temp_peerids.push(peerids[idx]);
                peerids.splice(idx, 1);
            }
            peerids = temp_peerids;
        }
        let errCode = peerids.length > 0 ? error_code_1.ErrorCode.RESULT_OK : error_code_1.ErrorCode.RESULT_SKIPPED;
        return { err: errCode, peers: peerids, ignore0 };
    }
    _connectTo(peerid) {
        let vport = this.m_vport;
        let connection = this.m_bdtStack.newConnection();
        connection.bind(null);
        return new Promise((resolve, reject) => {
            connection.connect({
                peerid,
                vport,
            });
            connection.on(P2P.Connection.EVENT.close, () => {
                resolve({ err: error_code_1.ErrorCode.RESULT_EXCEPTION });
            });
            connection.on(P2P.Connection.EVENT.error, (error) => {
                console.log('Connection error', peerid, error);
                resolve({ err: error_code_1.ErrorCode.RESULT_EXCEPTION });
            });
            connection.on(P2P.Connection.EVENT.connect, () => {
                let connNodeType = this._nodeConnectionType();
                let connNode = (new connNodeType(this, { bdt_connection: connection, remote: peerid }));
                resolve({ err: error_code_1.ErrorCode.RESULT_OK, conn: connNode });
            });
        });
    }
    _connectionType() {
        return connection_1.BdtConnection;
    }
    uninit() {
        // TODO:
        return super.uninit();
    }
    listen() {
        return new Promise((resolve, reject) => {
            const acceptor = this.m_bdtStack.newAcceptor({
                vport: this.m_vport,
            });
            acceptor.listen();
            // listen 之后 peer ready(上层chain node 已经准备好，被发现)
            this._ready();
            acceptor.on(P2P.Acceptor.EVENT.close, () => {
                acceptor.close();
            });
            acceptor.on(P2P.Acceptor.EVENT.connection, (bdt_connection) => {
                const remoteObject = bdt_connection.remote;
                const remote = `${remoteObject.peerid}:${remoteObject.vport}`;
                let connNodeType = this._nodeConnectionType();
                let connNode = (new connNodeType(this, { bdt_connection, remote }));
                // 调用_onInbound, 将成功的连接保存
                this._onInbound(connNode);
            });
            acceptor.on('error', () => {
                reject(error_code_1.ErrorCode.RESULT_EXCEPTION);
            });
            resolve(error_code_1.ErrorCode.RESULT_OK);
        });
    }
}
exports.BdtNode = BdtNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldF9iZHQvbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLDhDQUF3QztBQUN4QyxnQ0FBMEQ7QUFDMUQsNkNBQTJDO0FBQzNDLE1BQU0sRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVqRCxhQUFxQixTQUFRLFdBQUs7SUFZOUIscUNBQXFDO0lBQ3JDLG9CQUFvQjtJQUNwQiw2RUFBNkU7SUFDN0UsSUFBSTtJQUNKLFlBQVksT0FHb0g7UUFFNUgsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBZG5CLHlDQUF5QztRQUN6QyxpQ0FBaUM7UUFDekIsWUFBTyxHQUFXLElBQUksQ0FBQztRQUN2QixlQUFVLEdBQWEsRUFBRSxDQUFDO1FBYTlCLElBQUksQ0FBQyxlQUFlLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUN2QyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBRTNCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxLQUFLLENBQUMsSUFBSTtR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