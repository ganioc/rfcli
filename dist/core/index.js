"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = require("bignumber.js");
exports.BigNumber = bignumber_js_1.BigNumber;
__export(require("./serializable"));
__export(require("./error_code"));
__export(require("./address"));
__export(require("./lib/logger_util"));
__export(require("./lib/decimal_transfer"));
__export(require("./chain"));
__export(require("./value_chain"));
__export(require("./pow_chain"));
__export(require("./dpos_chain"));
__export(require("./net"));
__export(require("./dbft_chain"));
var node_1 = require("./net_tcp/node");
exports.TcpNode = node_1.TcpNode;
var node_2 = require("./net_bdt/node");
exports.BdtNode = node_2.BdtNode;
var node_3 = require("./net_standalone/node");
exports.StandaloneNode = node_3.StandaloneNode;
var chain_creator_1 = require("./chain_creator");
exports.ChainCreator = chain_creator_1.ChainCreator;
__export(require("./lib/digest"));
__export(require("./lib/encoding"));
const fs = require("fs-extra");
const network_1 = require("./block/network");
const chain_creator_2 = require("./chain_creator");
const value_chain_1 = require("./value_chain");
const pow_chain_1 = require("./pow_chain");
const dpos_chain_1 = require("./dpos_chain");
const dbft_chain_1 = require("./dbft_chain");
const logger_util_1 = require("./lib/logger_util");
const node_4 = require("./net_tcp/node");
const node_5 = require("./net_standalone/node");
const net_1 = require("./net");
const node_6 = require("./net_bdt/node");
const random_outbound_network_1 = require("./block/random_outbound_network");
const validators_network_1 = require("./dbft_chain/validators_network");
const dpos_bft_chain_1 = require("./dpos_bft_chain");
function initChainCreator(options) {
    const logger = logger_util_1.initLogger(options);
    const networkCreator = new network_1.NetworkCreator({ logger });
    networkCreator.registerNode('tcp', (commandOptions) => {
        let network = commandOptions.get('network');
        if (!network) {
            network = 'default';
        }
        let _host = commandOptions.get('host');
        if (!_host) {
            console.error('invalid tcp host');
            return;
        }
        let port = commandOptions.get('port');
        if (!port) {
            console.error('invalid tcp port');
            return;
        }
        let peers = commandOptions.get('peers');
        if (!peers) {
            peers = [];
        }
        else {
            peers = peers.split(';');
        }
        let nodeType = net_1.staticPeeridIp.splitInstance(net_1.StaticOutNode(node_4.TcpNode));
        return new nodeType(peers, { network, peerid: `${_host}:${port}`, host: _host, port });
    });
    networkCreator.registerNode('standalone', (commandOptions) => {
        let network = commandOptions.get('network');
        if (!network) {
            network = 'default';
        }
        let peerid = commandOptions.get('peerid');
        if (!peerid) {
            peerid = 'default';
        }
        return new node_5.StandaloneNode(network, peerid);
    });
    networkCreator.registerNode('bdt', (commandOptions) => {
        let network = commandOptions.get('network');
        if (!network) {
            network = 'default';
        }
        let _host = commandOptions.get('host');
        if (!_host) {
            console.error('invalid bdt host');
            return;
        }
        let port = commandOptions.get('port');
        if (!port) {
            console.error('no bdt port');
            return;
        }
        port = port.split('|');
        let udpport = 0;
        let tcpport = parseInt(port[0]);
        if (port.length === 1) {
            udpport = tcpport + 10;
        }
        else {
            udpport = parseInt(port[1]);
        }
        if (isNaN(tcpport) || isNaN(udpport)) {
            console.error('invalid bdt port');
            return;
        }
        let peerid = commandOptions.get('peerid');
        if (!peerid) {
            peerid = `${_host}:${port}`;
        }
        let snPeers = commandOptions.get('sn');
        if (!snPeers) {
            console.error('no sn');
            return;
        }
        let snconfig = snPeers.split('@');
        if (snconfig.length !== 4) {
            console.error('invalid sn: <SN_PEERID>@<SN_IP>@<SN_TCP_PORT>@<SN_UDP_PORT>');
            return;
        }
        const snPeer = {
            peerid: `${snconfig[0]}`,
            eplist: [
                `4@${snconfig[1]}@${snconfig[2]}@t`,
                `4@${snconfig[1]}@${snconfig[3]}@u`
            ]
        };
        let bdt_logger = {
            level: commandOptions.get('bdt_log_level') || 'info',
            // 设置log目录
            file_dir: commandOptions.get('dataDir') + '/log',
            file_name: commandOptions.get('bdt_log_name') || 'bdt',
        };
        let dhtAppID = 0;
        if (commandOptions.has('networkid')) {
            dhtAppID = parseInt(commandOptions.get('networkid'));
            if (isNaN(dhtAppID)) {
                dhtAppID = 0;
            }
        }
        let initDHTEntry;
        const initDHTFile = commandOptions.get('dataDir') + '/peers';
        if (fs.pathExistsSync(initDHTFile)) {
            initDHTEntry = fs.readJSONSync(initDHTFile);
        }
        return new node_6.BdtNode({ network, host: _host, tcpport, udpport, peerid, snPeer, dhtAppID, bdtLoggerOptions: bdt_logger, initDHTEntry });
    });
    networkCreator.registerNetwork('random', random_outbound_network_1.RandomOutNetwork);
    networkCreator.registerNetwork('validators', validators_network_1.ValidatorsNetwork);
    networkCreator.registerNetwork('dposbft', dpos_bft_chain_1.DposBftNetwork);
    let _creator = new chain_creator_2.ChainCreator({ logger, networkCreator });
    _creator.registerChainType('pow', {
        newHandler(creator, typeOptions) {
            return new value_chain_1.ValueHandler();
        },
        newChain(creator, dataDir, config) {
            return new pow_chain_1.PowChain({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        },
        newMiner(creator, dataDir, config) {
            return new pow_chain_1.PowMiner({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        }
    });
    _creator.registerChainType('dpos', {
        newHandler(creator, typeOptions) {
            return new value_chain_1.ValueHandler();
        },
        newChain(creator, dataDir, config) {
            return new dpos_chain_1.DposChain({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        },
        newMiner(creator, dataDir, config) {
            return new dpos_chain_1.DposMiner({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        }
    });
    _creator.registerChainType('dbft', {
        newHandler(creator, typeOptions) {
            return new value_chain_1.ValueHandler();
        },
        newChain(creator, dataDir, config) {
            return new dbft_chain_1.DbftChain({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        },
        newMiner(creator, dataDir, config) {
            return new dbft_chain_1.DbftMiner({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        }
    });
    _creator.registerChainType('dposbft', {
        newHandler(creator, typeOptions) {
            return new value_chain_1.ValueHandler();
        },
        newChain(creator, dataDir, config) {
            return new dpos_bft_chain_1.DposBftChain({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        },
        newMiner(creator, dataDir, config) {
            return new dpos_bft_chain_1.DposBftMiner({ networkCreator, logger: creator.logger, handler: config.handler, dataDir, globalOptions: config.globalOptions });
        }
    });
    return _creator;
}
exports.initChainCreator = initChainCreator;
__export(require("./chain_debuger"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUF1QztBQUEvQixtQ0FBQSxTQUFTLENBQUE7QUFDakIsb0NBQStCO0FBQy9CLGtDQUE2QjtBQUM3QiwrQkFBMEI7QUFDMUIsdUNBQWtDO0FBQ2xDLDRDQUF1QztBQUN2Qyw2QkFBd0I7QUFDeEIsbUNBQThCO0FBQzlCLGlDQUE0QjtBQUM1QixrQ0FBNkI7QUFDN0IsMkJBQXNCO0FBQ3RCLGtDQUE2QjtBQUM3Qix1Q0FBdUM7QUFBL0IseUJBQUEsT0FBTyxDQUFBO0FBQ2YsdUNBQXVDO0FBQS9CLHlCQUFBLE9BQU8sQ0FBQTtBQUNmLDhDQUFxRDtBQUE3QyxnQ0FBQSxjQUFjLENBQUE7QUFDdEIsaURBQTZDO0FBQXJDLHVDQUFBLFlBQVksQ0FBQTtBQUNwQixrQ0FBNkI7QUFDN0Isb0NBQStCO0FBRS9CLCtCQUErQjtBQUMvQiw2Q0FBK0M7QUFDL0MsbURBQW1FO0FBQ25FLCtDQUErRDtBQUMvRCwyQ0FBaUQ7QUFDakQsNkNBQW9EO0FBQ3BELDZDQUFvRDtBQUNwRCxtREFBOEQ7QUFDOUQseUNBQXVDO0FBQ3ZDLGdEQUFxRDtBQUNyRCwrQkFBb0Q7QUFDcEQseUNBQXVDO0FBQ3ZDLDZFQUFpRTtBQUNqRSx3RUFBa0U7QUFFbEUscURBQTRFO0FBRTVFLDBCQUFpQyxPQUFzQjtJQUNuRCxNQUFNLE1BQU0sR0FBRyx3QkFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25DLE1BQU0sY0FBYyxHQUFHLElBQUksd0JBQWMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDcEQsY0FBYyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxjQUFnQyxFQUFPLEVBQUU7UUFDekUsSUFBSSxPQUFPLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUM1QyxJQUFJ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