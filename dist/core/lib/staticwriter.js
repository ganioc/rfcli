/*!
 * staticwriter.js - buffer writer for bcoin
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const encoding_1 = require("./encoding");
const digest = require("./digest");
const EMPTY = Buffer.alloc(0);
const POOLSIZE = 100 << 10;
let POOL = null;
/**
 * Statically allocated buffer writer.
 * @alias module:utils.StaticWriter
 * @constructor
 * @param {Number} size
 */
class StaticWriter {
    constructor(size) {
        if (!(this instanceof StaticWriter)) {
            return new StaticWriter(size);
        }
        this.data = size ? Buffer.allocUnsafe(size) : EMPTY;
        this.offset = 0;
    }
    /**
     * Allocate writer from preallocated 100kb pool.
     * @param {Number} size
     * @returns {StaticWriter}
     */
    static pool(size) {
        if (size <= POOLSIZE) {
            if (!POOL) {
                POOL = Buffer.allocUnsafeSlow(POOLSIZE);
            }
            const bw = new StaticWriter(0);
            bw.data = POOL.slice(0, size);
            return bw;
        }
        return new StaticWriter(size);
    }
    /**
     * Allocate and render the final buffer.
     * @returns {Buffer} Rendered buffer.
     */
    render() {
        const data = this.data;
        assert(this.offset === data.length);
        this.destroy();
        return data;
    }
    /**
     * Get size of data written so far.
     * @returns {Number}
     */
    getSize() {
        return this.offset;
    }
    /**
     * Seek to relative offset.
     * @param {Number} offset
     */
    seek(offset) {
        this.offset += offset;
    }
    /**
     * Destroy the buffer writer.
     */
    destroy() {
        this.data = EMPTY;
        this.offset = 0;
    }
    /**
     * Write uint8.
     * @param {Number} value
     */
    writeU8(value) {
        this.offset = this.data.writeUInt8(value, this.offset, true);
    }
    /**
     * Write uint16le.
     * @param {Number} value
     */
    writeU16(value) {
        this.offset = this.data.writeUInt16LE(value, this.offset, true);
    }
    /**
     * Write uint16be.
     * @param {Number} value
     */
    writeU16BE(value) {
        this.offset = this.data.writeUInt16BE(value, this.offset, true);
    }
    /**
     * Write uint32le.
     * @param {Number} value
     */
    writeU32(value) {
        this.offset = this.data.writeUInt32LE(value, this.offset, true);
    }
    /**
     * Write uint32be.
     * @param {Number} value
     */
    writeU32BE(value) {
        this.offset = this.data.writeUInt32BE(value, this.offset, true);
    }
    /**
     * Write uint64le.
     * @param {Number} value
     */
    writeU64(value) {
        this.offset = encoding_1.Encoding.writeU64(this.data, value, this.offset);
    }
    /**
     * Write uint64be.
     * @param {Number} value
     */
    writeU64BE(value) {
        this.offset = encoding_1.Encoding.writeU64BE(this.data, value, this.offset);
    }
    /**
     * Write int8.
     * @param {Number} value
     */
    writeI8(value) {
        this.offset = this.data.writeInt8(value, this.offset, true);
    }
    /**
     * Write int16le.
     * @param {Number} value
     */
    writeI16(value) {
        this.offset = this.data.writeInt16LE(value, this.offset, true);
    }
    /**
     * Write int16be.
     * @param {Number} value
     */
    writeI16BE(value) {
        this.offset = this.data.writeInt16BE(value, this.offset, true);
    }
    /**
     * Write int32le.
     * @param {Number} value
     */
    writeI32(value) {
        this.offset = this.data.writeInt32LE(value, this.offset, true);
    }
    /**
     * Write int32be.
     * @param {Number} value
     */
    writeI32BE(value) {
        this.offset = this.data.writeInt32BE(value, this.offset, true);
    }
    /**
     * Write int64le.
     * @param {Number} value
     */
    writeI64(value) {
        this.offset = encoding_1.Encoding.writeI64(this.data, value, this.offset);
    }
    /**
     * Write int64be.
     * @param {Number} value
     */
    writeI64BE(value) {
        this.offset = encoding_1.Encoding.writeI64BE(this.data, value, this.offset);
    }
    /**
     * Write float le.
     * @param {Number} value
     */
    writeFloat(value) {
        this.offset = this.data.writeFloatLE(value, this.offset, true);
    }
    /**
     * Write float be.
     * @param {Number} value
     */
    writeFloatBE(value) {
        this.offset = this.data.writeFloatBE(value, this.offset, true);
    }
    /**
     * Write double le.
     * @param {Number} value
     */
    writeDouble(value) {
        this.offset = this.data.writeDoubleLE(value, this.offset, true);
    }
    /**
     * Write double be.
     * @param {Number} value
     */
    writeDoubleBE(value) {
        this.offset = this.data.writeDoubleBE(value, this.offset, true);
    }
    /**
     * Write a varint.
     * @param {Number} value
     */
    writeVarint(value) {
        this.offset = encoding_1.Encoding.writeVarint(this.data, value, this.offset);
    }
    /**
     * Write a varint (type 2).
     * @param {Number} value
     */
    writeVarint2(value) {
        this.offset = encoding_1.Encoding.writeVarint2(this.data, value, this.offset);
    }
    /**
     * Write bytes.
     * @param {Buffer} value
     */
    writeBytes(value) {
        if (value.length === 0) {
            return;
        }
        value.copy(this.data, this.offset);
        this.offset += value.length;
    }
    /**
     * Write bytes with a varint length before them.
     * @param {Buffer} value
     */
    writeVarBytes(value) {
        this.writeVarint(value.length);
        this.writeBytes(value);
    }
    /**
     * Copy bytes.
     * @param {Buffer} value
     * @param {Number} start
     * @param {Number} end
     */
    copy(value, start, end) {
        const len = end - start;
        if (len === 0) {
            return;
        }
        value.copy(this.data, this.offset, start, end);
        this.offset += len;
    }
    /**
     * Write string to buffer.
     * @param {String} value
     * @param {String?} enc - Any buffer-supported encoding.
     */
    writeString(value, enc) {
        if (value.length === 0) {
            return;
        }
        const size = Buffer.byteLength(value, enc);
        this.data.write(value, this.offset, undefined, enc);
        this.offset += size;
    }
    /**
     * Write a 32 byte hash.
     * @param {Hash} value
     */
    writeHash(value) {
        if (typeof value !== 'string') {
            assert(value.length === 32);
            this.writeBytes(value);
            return;
        }
        assert(value.length === 64);
        this.data.write(value, this.offset, undefined, 'hex');
        this.offset += 32;
    }
    /**
     * Write a string with a varint length before it.
     * @param {String}
     * @param {String?} enc - Any buffer-supported encoding.
     */
    writeVarString(value, enc) {
        if (value.length === 0) {
            this.writeVarint(0);
            return;
        }
        const size = Buffer.byteLength(value, enc);
        this.writeVarint(size);
        this.data.write(value, this.offset, undefined, enc);
        this.offset += size;
    }
    /**
     * Write a null-terminated string.
     * @param {String|Buffer}
     * @param {String?} enc - Any buffer-supported encoding.
     */
    writeNullString(value, enc) {
        this.writeString(value, enc);
        this.writeU8(0);
    }
    /**
     * Calculate and write a checksum for the data written so far.
     */
    writeChecksum() {
        const data = this.data.slice(0, this.offset);
        const hash = digest.hash256(data);
        hash.copy(this.data, this.offset, 0, 4);
        this.offset += 4;
    }
    /**
     * Fill N bytes with value.
     * @param {Number} value
     * @param {Number} size
     */
    fill(value, size) {
        assert(size >= 0);
        if (size === 0) {
            return;
        }
        this.data.fill(value, this.offset, this.offset + size);
        this.offset += size;
    }
}
exports.StaticWriter = StaticWriter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdGljd3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbGliL3N0YXRpY3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsWUFBWSxDQUFDOztBQUViLGlDQUFpQztBQUVqQyx5Q0FBc0M7QUFDdEMsbUNBQW1DO0FBRW5DLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztBQUUzQixJQUFJLElBQUksR0FBUSxJQUFJLENBQUM7QUFFckI7Ozs7O0dBS0c7QUFFSDtJQUdJLFlBQVksSUFBWTtRQUNwQixJQUFJLENBQUMsQ0FBQyxJQUFJLFlBQVksWUFBWSxDQUFDLEVBQUU7WUFDakMsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQztRQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDcEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDcEIsQ0FBQztJQUVEOzs7O09BSUc7SUFFSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQVk7UUFDM0IsSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1AsSUFBSSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDM0M7WUFFRCxNQUFNLEVBQUUsR0FBRyxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvQixFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlCLE9BQU8sRUFBRSxDQUFDO1NB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