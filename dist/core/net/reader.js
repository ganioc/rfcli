"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const package_1 = require("./package");
const events_1 = require("events");
const error_code_1 = require("../error_code");
const msgpack = require('msgpack-lite');
const assert = require('assert');
var READER_STATE;
(function (READER_STATE) {
    READER_STATE[READER_STATE["error"] = -1] = "error";
    READER_STATE[READER_STATE["wait"] = 0] = "wait";
    READER_STATE[READER_STATE["header"] = 1] = "header";
    READER_STATE[READER_STATE["body"] = 2] = "body";
    READER_STATE[READER_STATE["data"] = 3] = "data";
})(READER_STATE || (READER_STATE = {}));
var READER_EVENT;
(function (READER_EVENT) {
    READER_EVENT["error"] = "error";
    READER_EVENT["pkg"] = "pkg";
})(READER_EVENT = exports.READER_EVENT || (exports.READER_EVENT = {}));
class PackageStreamReader extends events_1.EventEmitter {
    constructor() {
        super();
        this.m_stateInfo = {
            state: READER_STATE.wait,
            pkg: new package_1.Package(),
            pendingLength: 0,
            pending: [],
        };
        this.m_connection = null;
        this.m_dataListener = (buffers) => {
            let stateInfo = this.m_stateInfo;
            if (stateInfo.state === READER_STATE.wait) {
                stateInfo.pkg = new package_1.Package();
                stateInfo.pending = [];
                stateInfo.state = READER_STATE.header;
                stateInfo.pendingLength = 0;
            }
            this._pushPending(buffers);
            do {
                if (stateInfo.state === READER_STATE.wait) {
                    stateInfo.pkg = new package_1.Package();
                    stateInfo.state = READER_STATE.header;
                }
                if (stateInfo.state === READER_STATE.header) {
                    let headerBuffers = this._popPending(package_1.Package.headerLength);
                    if (!headerBuffers) {
                        break;
                    }
                    let headerBuffer = Buffer.concat(headerBuffers);
                    let header = stateInfo.pkg.header;
                    let offset = 0;
                    header.magic = headerBuffer.readUInt16BE(offset);
                    offset += 2;
                    if (header.magic !== package_1.Package.magic) {
                        stateInfo.state = READER_STATE.error;
                        setImmediate(() => this.emit('error', error_code_1.ErrorCode.RESULT_PARSE_ERROR, 'magic' // 标记一下触发error的字段
                        ));
                    }
                    header.version = headerBuffer.readUInt16BE(offset);
                    offset += 2;
                    header.flags = headerBuffer.readUInt16BE(offset);
                    offset += 2;
                    header.cmdType = headerBuffer.readUInt16BE(offset);
                    offset += 2;
                    header.totalLength = headerBuffer.readUInt32BE(offset);
                    offset += 4;
                    header.bodyLength = headerBuffer.readUInt32BE(offset);
                    offset += 4;
                    stateInfo.state = READER_STATE.body;
                }
                if (stateInfo.state === READER_STATE.body) {
                    if (stateInfo.pkg.header.bodyLength) {
                        let bodyBuffers = this._popPending(stateInfo.pkg.header.bodyLength);
                        if (!bodyBuffers) {
                            break;
                        }
                        let bodyBuffer = Buffer.concat(bodyBuffers);
                        Object.assign(stateInfo.pkg.body, msgpack.decode(bodyBuffer));
                    }
                    stateInfo.state = READER_STATE.data;
                }
                if (stateInfo.state === READER_STATE.data) {
                    let pkg;
                    if (stateInfo.pkg.dataLength) {
                        let dataBuffers = this._popPending(stateInfo.pkg.dataLength);
                        if (!dataBuffers) {
                            break;
                        }
                        stateInfo.pkg.data.push(...dataBuffers);
                        pkg = stateInfo.pkg;
                    }
                    else {
                        pkg = stateInfo.pkg;
                    }
                    stateInfo.state = READER_STATE.wait;
                    if (pkg) {
                        pkg.data[0] = Buffer.concat(pkg.data);
                        setImmediate(() => { this.emit(READER_EVENT.pkg, pkg); });
                    }
                }
            } while (stateInfo.pendingLength);
        };
    }
    _clearPending() {
        this.m_stateInfo.pendingLength = 0;
        this.m_stateInfo.pending = [];
    }
    _popPending(length) {
        let stateInfo = this.m_stateInfo;
        if (length > stateInfo.pendingLength) {
            return null;
        }
        let next = length;
        let spliceTo = 0;
        let popLast = null;
        for (; spliceTo < stateInfo.pending.length; ++spliceTo) {
            let buffer = stateInfo.pending[spliceTo];
            if (buffer.length === next) {
                spliceTo += 1;
                break;
            }
            else if (buffer.length > next) {
                popLast = Buffer.from(buffer.buffer, buffer.offset, next);
                stateInfo.pending[spliceTo] = Buffer.from(buffer.buffer, buffer.offset + next, buffer.length - next);
                break;
            }
            else {
                next -= buffer.length;
            }
        }
        let pop = stateInfo.pending.splice(0, spliceTo);
        if (popLast) {
            pop.push(popLast);
        }
        stateInfo.pendingLength -= length;
        return pop;
    }
    _pushPending(buffers) {
        for (let buffer of buffers) {
            this.m_stateInfo.pending.push(buffer);
            this.m_stateInfo.pendingLength += buffer.length;
        }
    }
    start(connection) {
        if (this.m_connection) {
            return;
        }
        this.m_connection = connection;
        this.m_connection.on('data', this.m_dataListener);
    }
    stop() {
        if (this.m_connection) {
            this.m_connection.removeListener('data', this.m_dataListener);
            this.m_connection = null;
        }
    }
    close() {
        this.stop();
    }
}
exports.PackageStreamReader = PackageStreamReader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbmV0L3JlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHVDQUFpRDtBQUNqRCxtQ0FBb0M7QUFDcEMsOENBQXdDO0FBRXhDLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN4QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFakMsSUFBSyxZQU1KO0FBTkQsV0FBSyxZQUFZO0lBQ2Isa0RBQVUsQ0FBQTtJQUNWLCtDQUFRLENBQUE7SUFDUixtREFBVSxDQUFBO0lBQ1YsK0NBQVEsQ0FBQTtJQUNSLCtDQUFRLENBQUE7QUFDWixDQUFDLEVBTkksWUFBWSxLQUFaLFlBQVksUUFNaEI7QUFFRCxJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDcEIsK0JBQWUsQ0FBQTtJQUNmLDJCQUFXLENBQUE7QUFDZixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkI7QUFFRCx5QkFBaUMsU0FBUSxxQkFBWTtJQVVqRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNmLEtBQUssRUFBRSxZQUFZLENBQUMsSUFBSTtZQUN4QixHQUFHLEVBQUUsSUFBSSxpQkFBTyxFQUFFO1lBQ2xCLGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxFQUFFO1NBQ2QsQ0FBQztRQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEVBQUU7WUFDeEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUNqQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLEtBQUssWUFBWSxDQUFDLElBQUksRUFBRTtnQkFDdkMsU0FBUyxDQUFDLEdBQUcsR0FBRyxJQUFJ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