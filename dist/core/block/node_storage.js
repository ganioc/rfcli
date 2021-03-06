"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const path = require("path");
const fs = require("fs-extra");
class NodeStorage {
    constructor(options) {
        this.m_nodes = [];
        this.m_banNodes = [];
        this.m_bFlush = false;
        this.m_staticNodes = [];
        this.m_file = path.join(options.dataDir, 'nodeinfo');
        this.m_logger = options.logger;
        fs.ensureDirSync(options.dataDir);
        if (fs.existsSync(this.m_file)) {
            try {
                let json = fs.readJsonSync(this.m_file);
                this.m_nodes = json['nodes'] ? json['nodes'] : [];
                this.m_banNodes = json['bans'] ? json['bans'] : [];
            }
            catch (error) {
                this.m_logger.error(`read nodeinfo error `, error);
            }
        }
        // 在这里读一次staticnodes
        const staticFile = path.join(options.dataDir, 'staticnodes');
        if (fs.pathExistsSync(staticFile)) {
            try {
                this.m_staticNodes = fs.readJSONSync(staticFile);
            }
            catch (error) {
                this.m_logger.error(`read staticnodes error `, error);
            }
        }
        setInterval(() => {
            this.flush();
        }, 60 * 1000);
    }
    get(arg) {
        let count = 0;
        if (arg === 'all') {
            count = this.m_nodes.length;
        }
        else {
            count = count > this.m_nodes.length ? this.m_nodes.length : arg;
        }
        let peerids = this.m_nodes.slice(0, count);
        return peerids;
    }
    get staticNodes() {
        return this.m_staticNodes;
    }
    add(peerid) {
        let nIndex = this.getIndex(peerid);
        if (nIndex !== -1) {
            this.m_nodes.splice(nIndex, 1);
        }
        this.m_nodes.splice(0, 0, peerid);
        this.m_bFlush = true;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    remove(peerid) {
        let nIndex = this.getIndex(peerid);
        if (nIndex === -1) {
            return error_code_1.ErrorCode.RESULT_NOT_FOUND;
        }
        this.m_nodes.splice(nIndex, 1);
        this.m_bFlush = true;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    // time的单位为分钟
    ban(peerid, time) {
        let nIndex = this.getIndex(peerid);
        if (nIndex !== -1) {
            this.m_nodes.splice(nIndex, 1);
        }
        nIndex = this.getBanIndex(peerid);
        if (nIndex !== -1) {
            this.m_banNodes.splice(nIndex, 1);
        }
        let info = { peerid, endtime: time === 0 ? 0 : Date.now() + time * 60 * 1000 };
        let pos = 0;
        for (let i = 0; i < this.m_banNodes.length; i++) {
            pos++;
            if (info.endtime <= this.m_banNodes[i].endtime) {
                break;
            }
        }
        this.m_banNodes.splice(pos, 0, info);
        this.m_bFlush = true;
        return error_code_1.ErrorCode.RESULT_OK;
    }
    isBan(peerid) {
        let nIndex = this.getBanIndex(peerid);
        if (nIndex === -1) {
            return false;
        }
        if (this.m_banNodes[nIndex].endtime === 0) {
            return true;
        }
        if (Date.now() >= this.m_banNodes[nIndex].endtime) {
            this.m_banNodes.splice(nIndex, 1);
            this.m_bFlush = true;
            return true;
        }
        return false;
    }
    getIndex(peerid) {
        for (let i = 0; i < this.m_nodes.length; i++) {
            if (this.m_nodes[i] === peerid) {
                return i;
            }
        }
        return -1;
    }
    getBanIndex(peerid) {
        for (let i = 0; i < this.m_banNodes.length; i++) {
            if (this.m_banNodes[i].peerid === peerid) {
                return i;
            }
        }
        return -1;
    }
    flush() {
        if (!this.m_bFlush) {
            return;
        }
        try {
            let json = {};
            json['nodes'] = this.m_nodes;
            json['bans'] = this.m_banNodes;
            fs.writeJsonSync(this.m_file, json);
            this.m_bFlush = false;
        }
        catch (e) {
            this.m_logger.error(`[node_storage NodeStorage flush] ${e.toString()}`);
        }
    }
}
exports.NodeStorage = NodeStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZV9zdG9yYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvYmxvY2svbm9kZV9zdG9yYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXdDO0FBQ3hDLDZCQUE2QjtBQUU3QiwrQkFBK0I7QUFhL0I7SUFRSSxZQUFZLE9BQTJCO1FBUDdCLFlBQU8sR0FBYSxFQUFFLENBQUM7UUFDdkIsZUFBVSxHQUFjLEVBQUUsQ0FBQztRQUUzQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpCLGtCQUFhLEdBQWEsRUFBRSxDQUFDO1FBR25DLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUUvQixFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVCLElBQUk7Z0JBQ0EsSUFBSSxJQUFJLEdBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzdDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ3REO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsS0FB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