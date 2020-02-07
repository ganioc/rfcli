"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const package_1 = require("./package");
const events_1 = require("events");
const msgpack = require('msgpack-lite');
const assert = require('assert');
var WRITER_EVENT;
(function (WRITER_EVENT) {
    WRITER_EVENT["error"] = "error";
    WRITER_EVENT["finish"] = "finish";
})(WRITER_EVENT = exports.WRITER_EVENT || (exports.WRITER_EVENT = {}));
class PackageStreamWriter extends events_1.EventEmitter {
    constructor() {
        super();
        this.m_pending = [];
        this.m_toSendLength = 0;
        this.m_writtenLength = 0;
        this.m_sentLength = 0;
    }
    static fromPackage(cmdType, body, dataLength = 0) {
        let writer = new PackageStreamWriter();
        let writeHeader = {
            version: 0,
            magic: package_1.Package.magic,
            flags: 0,
            bodyLength: 0,
            totalLength: 0,
            cmdType,
        };
        let bodyBuffer = null;
        writeHeader.bodyLength = 0;
        if (body) {
            bodyBuffer = msgpack.encode(body);
            writeHeader.bodyLength = bodyBuffer.length;
        }
        writeHeader.totalLength = package_1.Package.headerLength + writeHeader.bodyLength + dataLength;
        let headerBuffer = Buffer.alloc(package_1.Package.headerLength);
        let offset = 0;
        offset = headerBuffer.writeUInt16BE(writeHeader.magic, offset);
        offset = headerBuffer.writeUInt16BE(writeHeader.version, offset);
        offset = headerBuffer.writeUInt16BE(writeHeader.flags, offset);
        offset = headerBuffer.writeUInt16BE(writeHeader.cmdType, offset);
        offset = headerBuffer.writeUInt32BE(writeHeader.totalLength, offset);
        offset = headerBuffer.writeUInt32BE(writeHeader.bodyLength, offset);
        writer.m_toSendLength = writeHeader.totalLength;
        writer.m_writtenLength = package_1.Package.headerLength + writeHeader.bodyLength;
        writer.m_pending.push(headerBuffer);
        if (bodyBuffer) {
            writer.m_pending.push(bodyBuffer);
        }
        return writer;
    }
    bind(connection) {
        assert(!this.m_connection);
        if (this.m_connection) {
            return this;
        }
        this.m_connection = connection;
        this._doSend();
        return this;
    }
    clone() {
        let writer = new PackageStreamWriter();
        for (let buf of this.m_pending) {
            let _buf = buf;
            writer.m_pending.push(Buffer.from(_buf.buffer, _buf.offset, _buf.length));
        }
        writer.m_toSendLength = this.m_toSendLength;
        writer.m_writtenLength = 0;
        writer.m_sentLength = 0;
        writer.m_drainListener = undefined;
        return writer;
    }
    writeData(buffer) {
        if (!buffer.length) {
            return this;
        }
        if (this.m_writtenLength + buffer.length > this.m_toSendLength) {
            return this;
        }
        this.m_writtenLength += buffer.length;
        this.m_pending.push(buffer);
        this._doSend();
        return this;
    }
    async _doSend() {
        if (!this.m_connection) {
            return;
        }
        if (this.m_drainListener) {
            return;
        }
        let spliceTo = 0;
        for (; spliceTo < this.m_pending.length; ++spliceTo) {
            let buffer = this.m_pending[spliceTo];
            let sent = this.m_connection.send(buffer);
            if (sent < 0) {
                setImmediate(() => { this.emit(WRITER_EVENT.error); });
                return;
            }
            this.m_sentLength += sent;
            if (sent < buffer.length) {
                assert(!this.m_drainListener);
                this.m_drainListener = () => {
                    this.m_drainListener = undefined;
                    this._doSend();
                };
                this.m_pending[spliceTo] = Buffer.from(buffer.buffer, buffer.offset + sent, buffer.length - sent);
                this.m_connection.once('drain', this.m_drainListener);
                break;
            }
        }
        this.m_pending.splice(0, spliceTo);
        assert(this.m_sentLength <= this.m_toSendLength);
        if (this.m_sentLength === this.m_toSendLength) {
            setImmediate(() => { this.emit(WRITER_EVENT.finish); });
        }
    }
    close() {
        if (this.m_connection && this.m_drainListener) {
            this.m_connection.removeListener('drain', this.m_drainListener);
        }
        this.removeAllListeners(WRITER_EVENT.finish);
        this.removeAllListeners(WRITER_EVENT.error);
        this.m_connection = undefined;
        this.m_drainListener = undefined;
        return;
    }
}
exports.PackageStreamWriter = PackageStreamWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbmV0L3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFpRDtBQUNqRCxtQ0FBb0M7QUFJcEMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3hDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxJQUFZLFlBR1g7QUFIRCxXQUFZLFlBQVk7SUFDcEIsK0JBQWUsQ0FBQTtJQUNmLGlDQUFpQixDQUFBO0FBQ3JCLENBQUMsRUFIVyxZQUFZLEdBQVosb0JBQVksS0FBWixvQkFBWSxRQUd2QjtBQUVELHlCQUFpQyxTQUFRLHFCQUFZO0lBT2pEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFlLEVBQUUsSUFBUyxFQUFFLGFBQXFCLENBQUM7UUFDakUsSUFBSSxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3ZDLElBQUksV0FBVyxHQUFrQjtZQUM3QixPQUFPLEVBQUUsQ0FBQztZQUNWLEtBQUssRUFBRSxpQkFBTyxDQUFDLEtBQUs7WUFDcEIsS0FBSyxFQUFFLENBQUM7WUFDUixVQUFVLEVBQUUsQ0FBQztZQUNiLFdBQVcsRUFBRSxDQUFDO1lBQ2QsT0FBTztTQUNWLENBQUM7UUFFRixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUM7UUFDdEIsV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDM0IsSUFBSSxJQUFJLEVBQUU7WUFDTixV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