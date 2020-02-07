/*!
 * reader.js - buffer reader for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const encoding_1 = require("./encoding");
const digest = require("./digest");
const bignumber_js_1 = require("bignumber.js");
const EMPTY = Buffer.alloc(0);
/**
 * An object that allows reading of buffers in a sane manner.
 * @alias module:utils.BufferReader
 * @constructor
 * @param {Buffer} data
 * @param {Boolean?} zeroCopy - Do not reallocate buffers when
 * slicing. Note that this can lead to memory leaks if not used
 * carefully.
 */
class BufferReader {
    constructor(data, zeroCopy) {
        if (!(this instanceof BufferReader)) {
            return new BufferReader(data, zeroCopy);
        }
        assert(Buffer.isBuffer(data), 'Must pass a Buffer.');
        this.data = data;
        this.offset = 0;
        this.zeroCopy = zeroCopy || false;
        this.stack = [];
    }
    /**
     * Assertion.
     * @param {Boolean} value
     */
    assert(value) {
        if (!value) {
            throw new encoding_1.EncodingError(this.offset, 'Out of bounds read', assert);
        }
    }
    /**
     * Assertion.
     * @param {Boolean} value
     * @param {String} reason
     */
    enforce(value, reason) {
        if (!value) {
            throw new encoding_1.EncodingError(this.offset, reason);
        }
    }
    /**
     * Get total size of passed-in Buffer.
     * @returns {Buffer}
     */
    getSize() {
        return this.data.length;
    }
    /**
     * Calculate number of bytes left to read.
     * @returns {Number}
     */
    left() {
        this.assert(this.offset <= this.data.length);
        return this.data.length - this.offset;
    }
    /**
     * Seek to a position to read from by offset.
     * @param {Number} off - Offset (positive or negative).
     */
    seek(off) {
        this.assert(this.offset + off >= 0);
        this.assert(this.offset + off <= this.data.length);
        this.offset += off;
        return off;
    }
    /**
     * Mark the current starting position.
     */
    start() {
        this.stack.push(this.offset);
        return this.offset;
    }
    /**
     * Stop reading. Pop the start position off the stack
     * and calculate the size of the data read.
     * @returns {Number} Size.
     * @throws on empty stack.
     */
    end() {
        assert(this.stack.length > 0);
        const start = this.stack.pop();
        return this.offset - start;
    }
    /**
     * Stop reading. Pop the start position off the stack
     * and return the data read.
     * @param {Bolean?} zeroCopy - Do a fast buffer
     * slice instead of allocating a new buffer (warning:
     * may cause memory leaks if not used with care).
     * @returns {Buffer} Data read.
     * @throws on empty stack.
     */
    endData(zeroCopy) {
        assert(this.stack.length > 0);
        const start = this.stack.pop();
        const end = this.offset;
        const size = end - start;
        const data = this.data;
        if (size === data.length) {
            return data;
        }
        if (this.zeroCopy || zeroCopy) {
            return data.slice(start, end);
        }
        const ret = Buffer.allocUnsafe(size);
        data.copy(ret, 0, start, end);
        return ret;
    }
    /**
     * Destroy the reader. Remove references to the data.
     */
    destroy() {
        this.data = EMPTY;
        this.offset = 0;
        this.stack.length = 0;
    }
    /**
     * Read uint8.
     * @returns {Number}
     */
    readU8() {
        this.assert(this.offset + 1 <= this.data.length);
        const ret = this.data[this.offset];
        this.offset += 1;
        return ret;
    }
    /**
     * Read uint16le.
     * @returns {Number}
     */
    readU16() {
        this.assert(this.offset + 2 <= this.data.length);
        const ret = this.data.readUInt16LE(this.offset, true);
        this.offset += 2;
        return ret;
    }
    /**
     * Read uint16be.
     * @returns {Number}
     */
    readU16BE() {
        this.assert(this.offset + 2 <= this.data.length);
        const ret = this.data.readUInt16BE(this.offset, true);
        this.offset += 2;
        return ret;
    }
    /**
     * Read uint32le.
     * @returns {Number}
     */
    readU32() {
        this.assert(this.offset + 4 <= this.data.length);
        const ret = this.data.readUInt32LE(this.offset, true);
        this.offset += 4;
        return ret;
    }
    /**
     * Read uint32be.
     * @returns {Number}
     */
    readU32BE() {
        this.assert(this.offset + 4 <= this.data.length);
        const ret = this.data.readUInt32BE(this.offset, true);
        this.offset += 4;
        return ret;
    }
    /**
     * Read uint64le as a js number.
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    readU64() {
        this.assert(this.offset + 8 <= this.data.length);
        const ret = encoding_1.Encoding.readU64(this.data, this.offset);
        this.offset += 8;
        return ret;
    }
    /**
     * Read uint64be as a js number.
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    readU64BE() {
        this.assert(this.offset + 8 <= this.data.length);
        const ret = encoding_1.Encoding.readU64BE(this.data, this.offset);
        this.offset += 8;
        return ret;
    }
    /**
     * Read int8.
     * @returns {Number}
     */
    readI8() {
        this.assert(this.offset + 1 <= this.data.length);
        const ret = this.data.readInt8(this.offset, true);
        this.offset += 1;
        return ret;
    }
    /**
     * Read int16le.
     * @returns {Number}
     */
    readI16() {
        this.assert(this.offset + 2 <= this.data.length);
        const ret = this.data.readInt16LE(this.offset, true);
        this.offset += 2;
        return ret;
    }
    /**
     * Read int16be.
     * @returns {Number}
     */
    readI16BE() {
        this.assert(this.offset + 2 <= this.data.length);
        const ret = this.data.readInt16BE(this.offset, true);
        this.offset += 2;
        return ret;
    }
    /**
     * Read int32le.
     * @returns {Number}
     */
    readI32() {
        this.assert(this.offset + 4 <= this.data.length);
        const ret = this.data.readInt32LE(this.offset, true);
        this.offset += 4;
        return ret;
    }
    /**
     * Read int32be.
     * @returns {Number}
     */
    readI32BE() {
        this.assert(this.offset + 4 <= this.data.length);
        const ret = this.data.readInt32BE(this.offset, true);
        this.offset += 4;
        return ret;
    }
    /**
     * Read int64le as a js number.
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    readI64() {
        this.assert(this.offset + 8 <= this.data.length);
        const ret = encoding_1.Encoding.readI64(this.data, this.offset);
        this.offset += 8;
        return ret;
    }
    /**
     * Read int64be as a js number.
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    readI64BE() {
        this.assert(this.offset + 8 <= this.data.length);
        const ret = encoding_1.Encoding.readI64BE(this.data, this.offset);
        this.offset += 8;
        return ret;
    }
    /**
     * Read float le.
     * @returns {Number}
     */
    readFloat() {
        this.assert(this.offset + 4 <= this.data.length);
        const ret = this.data.readFloatLE(this.offset, true);
        this.offset += 4;
        return ret;
    }
    /**
     * Read float be.
     * @returns {Number}
     */
    readFloatBE() {
        this.assert(this.offset + 4 <= this.data.length);
        const ret = this.data.readFloatBE(this.offset, true);
        this.offset += 4;
        return ret;
    }
    /**
     * Read double float le.
     * @returns {Number}
     */
    readDouble() {
        this.assert(this.offset + 8 <= this.data.length);
        const ret = this.data.readDoubleLE(this.offset, true);
        this.offset += 8;
        return ret;
    }
    /**
     * Read double float be.
     * @returns {Number}
     */
    readDoubleBE() {
        this.assert(this.offset + 8 <= this.data.length);
        const ret = this.data.readDoubleBE(this.offset, true);
        this.offset += 8;
        return ret;
    }
    /**
     * Read a varint.
     * @returns {Number}
     */
    readVarint() {
        const { size, value } = encoding_1.Encoding.readVarint(this.data, this.offset);
        this.offset += size;
        return value;
    }
    /**
     * Read a varint (type 2).
     * @returns {Number}
     */
    readVarint2() {
        const { size, value } = encoding_1.Encoding.readVarint2(this.data, this.offset);
        this.offset += size;
        return value;
    }
    /**
     * Read N bytes (will do a fast slice if zero copy).
     * @param {Number} size
     * @param {Bolean?} zeroCopy - Do a fast buffer
     * slice instead of allocating a new buffer (warning:
     * may cause memory leaks if not used with care).
     * @returns {Buffer}
     */
    readBytes(size, zeroCopy) {
        assert(size >= 0);
        this.assert(this.offset + size <= this.data.length);
        let ret;
        if (this.zeroCopy || zeroCopy) {
            ret = this.data.slice(this.offset, this.offset + size);
        }
        else {
            ret = Buffer.allocUnsafe(size);
            this.data.copy(ret, 0, this.offset, this.offset + size);
        }
        this.offset += size;
        return ret;
    }
    /**
     * Read a varint number of bytes (will do a fast slice if zero copy).
     * @param {Bolean?} zeroCopy - Do a fast buffer
     * slice instead of allocating a new buffer (warning:
     * may cause memory leaks if not used with care).
     * @returns {Buffer}
     */
    readVarBytes(zeroCopy) {
        return this.readBytes(this.readVarint(), zeroCopy);
    }
    /**
     * Read a string.
     * @param {String} enc - Any buffer-supported Encoding.
     * @param {Number} size
     * @returns {String}
     */
    readString(enc, size) {
        assert(size >= 0);
        this.assert(this.offset + size <= this.data.length);
        const ret = this.data.toString(enc, this.offset, this.offset + size);
        this.offset += size;
        return ret;
    }
    readHash(enc) {
        if (enc) {
            return this.readString(enc, 32);
        }
        return this.readBytes(32);
    }
    /**
     * Read string of a varint length.
     * @param {String} enc - Any buffer-supported Encoding.
     * @param {Number?} limit - Size limit.
     * @returns {String}
     */
    readVarString(enc, limit) {
        const size = this.readVarint();
        this.enforce(!limit || size <= limit, 'String exceeds limit.');
        return this.readString(enc, size);
    }
    readBigNumber() {
        let str = this.readVarString();
        return new bignumber_js_1.BigNumber(str);
    }
    /**
     * Read a null-terminated string.
     * @param {String} enc - Any buffer-supported Encoding.
     * @returns {String}
     */
    readNullString(enc) {
        this.assert(this.offset + 1 <= this.data.length);
        let i = this.offset;
        for (; i < this.data.length; i++) {
            if (this.data[i] === 0) {
                break;
            }
        }
        this.assert(i !== this.data.length);
        const ret = this.readString(enc, i - this.offset);
        this.offset = i + 1;
        return ret;
    }
    /**
     * Create a checksum from the last start position.
     * @returns {Number} Checksum.
     */
    createChecksum() {
        let start = 0;
        if (this.stack.length > 0) {
            start = this.stack[this.stack.length - 1];
        }
        const data = this.data.slice(start, this.offset);
        return digest.hash256(data).readUInt32LE(0, true);
    }
    /**
     * Verify a 4-byte checksum against a calculated checksum.
     * @returns {Number} checksum
     * @throws on bad checksum
     */
    verifyChecksum() {
        const chk = this.createChecksum();
        const checksum = this.readU32();
        this.enforce(chk === checksum, 'Checksum mismatch.');
        return checksum;
    }
}
exports.BufferReader = BufferReader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbGliL3JlYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUVILFlBQVksQ0FBQzs7QUFDYixpQ0FBaUM7QUFDakMseUNBQW1EO0FBQ25ELG1DQUFtQztBQUNuQywrQ0FBdUM7QUFFdkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUU5Qjs7Ozs7Ozs7R0FRRztBQUVIO0lBQ0ksWUFBWSxJQUFZLEVBQUUsUUFBa0I7UUFDeEMsSUFBSSxDQUFDLENBQUMsSUFBSSxZQUFZLFlBQVksQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBRTNDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUVyRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsSUFBSSxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDcEIsQ0FBQztJQU9EOzs7T0FHRztJQUVILE1BQU0sQ0FBQyxLQUFVO1FBQ2IsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNSLE1BQU0sSUFBSSx3QkFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdEU7SUFDTCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUVILE9BQU8sQ0FBQyxLQUFjLEVBQUUsTUFBYztRQUNsQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1IsTUFBTSxJQUFJLHdCQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNoRDtJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFFSCxPQUFPO1FBQ0gsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsSUFBSTtRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUMxQyxDQUFDO0lBRUQ7OztPQUdHO0lBRUgsSUFBSSxDQUFDLEdBQVc7UUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNuQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7T0FFRztJQUVILEtBQUs7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUVILEdBQUc7UUFDQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUUvQixPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQy9CLENBQUM7SUFFRDs7Ozs7Ozs7T0FRRztJQUVILE9BQU8sQ0FBQyxRQUFrQjtRQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3hCLE1BQU0sSUFBSSxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDekIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUV2QixJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxFQUFFO1lBQzNCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDakM7UUFFRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFOUIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFFSCxPQUFPO1FBQ0gsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7O09BR0c7SUFFSCxNQUFNO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUVILE9BQU87UUFDSCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFFSCxTQUFTO1FBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsT0FBTztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUVILFNBQVM7UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7OztPQUlHO0lBRUgsT0FBTztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7OztPQUlHO0lBRUgsU0FBUztRQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxtQkFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFFSCxNQUFNO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsT0FBTztRQUNILElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUVILFNBQVM7UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFFSCxPQUFPO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsU0FBUztRQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxPQUFPO1FBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLG1CQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxTQUFTO1FBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLG1CQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUVILFNBQVM7UUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFFSCxXQUFXO1FBQ1AsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDakIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsVUFBVTtRQUNOLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ2pCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7T0FHRztJQUVILFlBQVk7UUFDUixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNqQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFFRDs7O09BR0c7SUFFSCxVQUFVO1FBQ04sTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxtQkFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztRQUNwQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsV0FBVztRQUNQLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsbUJBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUM7UUFDcEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFFSCxTQUFTLENBQUMsSUFBWSxFQUFFLFFBQWtCO1FBQ3RDLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXBELElBQUksR0FBRyxDQUFDO1FBQ1IsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsRUFBRTtZQUMzQixHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQzFEO2FBQU07WUFDSCxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztTQUMzRDtRQUVELElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDO1FBRXBCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUVILFlBQVksQ0FBQyxRQUFrQjtRQUMzQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRDs7Ozs7T0FLRztJQUVILFVBQVUsQ0FBQyxHQUF1QixFQUFFLElBQVk7UUFDNUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQztRQUNwQixPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFTRCxRQUFRLENBQUMsR0FBUztRQUNkLElBQUksR0FBRyxFQUFFO1lBQ0wsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNuQztRQUNELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFFSCxhQUFhLENBQUMsR0FBWSxFQUFFLEtBQWM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQy9CLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUVELGFBQWE7UUFDVCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDL0IsT0FBTyxJQUFJLHdCQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxjQUFjLENBQUMsR0FBVztRQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwQixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNwQixNQUFNO2FBQ1Q7U0FDSjtRQUVELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVsRCxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFcEIsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBRUgsY0FBYztRQUNWLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUVkLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3ZCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzdDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVqRCxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUVILGNBQWM7UUFDVixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDbEMsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxLQUFLLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQXhnQkQsb0NBd2dCQyJ9