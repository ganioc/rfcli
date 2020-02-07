/*!
 * writer.js - buffer writer for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const encoding_1 = require("./encoding");
const digest = require("./digest");
/*
 * Constants
 */
const SEEK = 0;
const UI8 = 1;
const UI16 = 2;
const UI16BE = 3;
const UI32 = 4;
const UI32BE = 5;
const UI64 = 6;
const UI64BE = 7;
const I8 = 10;
const I16 = 11;
const I16BE = 12;
const I32 = 13;
const I32BE = 14;
const I64 = 15;
const I64BE = 16;
const FL = 19;
const FLBE = 20;
const DBL = 21;
const DBLBE = 22;
const VARINT = 23;
const VARINT2 = 25;
const BYTES = 27;
const STR = 28;
const CHECKSUM = 29;
const FILL = 30;
/**
 * An object that allows writing of buffers in a
 * sane manner. This buffer writer is extremely
 * optimized since it does not actually write
 * anything until `render` is called. It makes
 * one allocation: at the end, once it knows the
 * size of the buffer to be allocated. Because
 * of this, it can also act as a size calculator
 * which is useful for guaging block size
 * without actually serializing any data.
 * @alias module:utils.BufferWriter
 * @constructor
 */
class BufferWriter {
    constructor() {
        if (!(this instanceof BufferWriter)) {
            return new BufferWriter();
        }
        this.ops = [];
        this.offset = 0;
    }
    /**
     * Allocate and render the final buffer.
     * @returns {Buffer} Rendered buffer.
     */
    render() {
        const data = Buffer.allocUnsafe(this.offset);
        let off = 0;
        for (const op of this.ops) {
            switch (op.type) {
                case SEEK:
                    off += op.value;
                    break;
                case UI8:
                    off = data.writeUInt8(op.value, off, true);
                    break;
                case UI16:
                    off = data.writeUInt16LE(op.value, off, true);
                    break;
                case UI16BE:
                    off = data.writeUInt16BE(op.value, off, true);
                    break;
                case UI32:
                    off = data.writeUInt32LE(op.value, off, true);
                    break;
                case UI32BE:
                    off = data.writeUInt32BE(op.value, off, true);
                    break;
                case UI64:
                    off = encoding_1.Encoding.writeU64(data, op.value, off);
                    break;
                case UI64BE:
                    off = encoding_1.Encoding.writeU64BE(data, op.value, off);
                    break;
                case I8:
                    off = data.writeInt8(op.value, off, true);
                    break;
                case I16:
                    off = data.writeInt16LE(op.value, off, true);
                    break;
                case I16BE:
                    off = data.writeInt16BE(op.value, off, true);
                    break;
                case I32:
                    off = data.writeInt32LE(op.value, off, true);
                    break;
                case I32BE:
                    off = data.writeInt32BE(op.value, off, true);
                    break;
                case I64:
                    off = encoding_1.Encoding.writeI64(data, op.value, off);
                    break;
                case I64BE:
                    off = encoding_1.Encoding.writeI64BE(data, op.value, off);
                    break;
                case FL:
                    off = data.writeFloatLE(op.value, off, true);
                    break;
                case FLBE:
                    off = data.writeFloatBE(op.value, off, true);
                    break;
                case DBL:
                    off = data.writeDoubleLE(op.value, off, true);
                    break;
                case DBLBE:
                    off = data.writeDoubleBE(op.value, off, true);
                    break;
                case VARINT:
                    off = encoding_1.Encoding.writeVarint(data, op.value, off);
                    break;
                case VARINT2:
                    off = encoding_1.Encoding.writeVarint2(data, op.value, off);
                    break;
                case BYTES:
                    off += op.value.copy(data, off);
                    break;
                case STR:
                    off += data.write(op.value, off, op.enc);
                    break;
                case CHECKSUM:
                    off += digest.hash256(data.slice(0, off)).copy(data, off, 0, 4);
                    break;
                case FILL:
                    data.fill(op.value, off, off + op.size);
                    off += op.size;
                    break;
                default:
                    assert(false, 'Bad type.');
                    break;
            }
        }
        assert(off === data.length);
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
        this.ops.push(new WriteOp(SEEK, offset));
    }
    /**
     * Destroy the buffer writer. Remove references to `ops`.
     */
    destroy() {
        this.ops.length = 0;
        this.offset = 0;
    }
    /**
     * Write uint8.
     * @param {Number} value
     */
    writeU8(value) {
        this.offset += 1;
        this.ops.push(new WriteOp(UI8, value));
    }
    /**
     * Write uint16le.
     * @param {Number} value
     */
    writeU16(value) {
        this.offset += 2;
        this.ops.push(new WriteOp(UI16, value));
    }
    /**
     * Write uint16be.
     * @param {Number} value
     */
    writeU16BE(value) {
        this.offset += 2;
        this.ops.push(new WriteOp(UI16BE, value));
    }
    /**
     * Write uint32le.
     * @param {Number} value
     */
    writeU32(value) {
        this.offset += 4;
        this.ops.push(new WriteOp(UI32, value));
    }
    /**
     * Write uint32be.
     * @param {Number} value
     */
    writeU32BE(value) {
        this.offset += 4;
        this.ops.push(new WriteOp(UI32BE, value));
    }
    /**
     * Write uint64le.
     * @param {Number} value
     */
    writeU64(value) {
        this.offset += 8;
        this.ops.push(new WriteOp(UI64, value));
    }
    /**
     * Write uint64be.
     * @param {Number} value
     */
    writeU64BE(value) {
        this.offset += 8;
        this.ops.push(new WriteOp(UI64BE, value));
    }
    /**
     * Write int8.
     * @param {Number} value
     */
    writeI8(value) {
        this.offset += 1;
        this.ops.push(new WriteOp(I8, value));
    }
    /**
     * Write int16le.
     * @param {Number} value
     */
    writeI16(value) {
        this.offset += 2;
        this.ops.push(new WriteOp(I16, value));
    }
    /**
     * Write int16be.
     * @param {Number} value
     */
    writeI16BE(value) {
        this.offset += 2;
        this.ops.push(new WriteOp(I16BE, value));
    }
    /**
     * Write int32le.
     * @param {Number} value
     */
    writeI32(value) {
        this.offset += 4;
        this.ops.push(new WriteOp(I32, value));
    }
    /**
     * Write int32be.
     * @param {Number} value
     */
    writeI32BE(value) {
        this.offset += 4;
        this.ops.push(new WriteOp(I32BE, value));
    }
    /**
     * Write int64le.
     * @param {Number} value
     */
    writeI64(value) {
        this.offset += 8;
        this.ops.push(new WriteOp(I64, value));
    }
    /**
     * Write int64be.
     * @param {Number} value
     */
    writeI64BE(value) {
        this.offset += 8;
        this.ops.push(new WriteOp(I64BE, value));
    }
    /**
     * Write float le.
     * @param {Number} value
     */
    writeFloat(value) {
        this.offset += 4;
        this.ops.push(new WriteOp(FL, value));
    }
    /**
     * Write float be.
     * @param {Number} value
     */
    writeFloatBE(value) {
        this.offset += 4;
        this.ops.push(new WriteOp(FLBE, value));
    }
    /**
     * Write double le.
     * @param {Number} value
     */
    writeDouble(value) {
        this.offset += 8;
        this.ops.push(new WriteOp(DBL, value));
    }
    /**
     * Write double be.
     * @param {Number} value
     */
    writeDoubleBE(value) {
        this.offset += 8;
        this.ops.push(new WriteOp(DBLBE, value));
    }
    /**
     * Write a varint.
     * @param {Number} value
     */
    writeVarint(value) {
        this.offset += encoding_1.Encoding.sizeVarint(value);
        this.ops.push(new WriteOp(VARINT, value));
    }
    /**
     * Write a varint (type 2).
     * @param {Number} value
     */
    writeVarint2(value) {
        this.offset += encoding_1.Encoding.sizeVarint2(value);
        this.ops.push(new WriteOp(VARINT2, value));
    }
    /**
     * Write bytes.
     * @param {Buffer} value
     */
    writeBytes(value) {
        if (value.length === 0) {
            return;
        }
        this.offset += value.length;
        this.ops.push(new WriteOp(BYTES, value));
    }
    /**
     * Write bytes with a varint length before them.
     * @param {Buffer} value
     */
    writeVarBytes(value) {
        this.offset += encoding_1.Encoding.sizeVarint(value.length);
        this.ops.push(new WriteOp(VARINT, value.length));
        if (value.length === 0) {
            return;
        }
        this.offset += value.length;
        this.ops.push(new WriteOp(BYTES, value));
    }
    writeBigNumber(value) {
        return this.writeVarString(value.toString());
    }
    /**
     * Copy bytes.
     * @param {Buffer} value
     * @param {Number} start
     * @param {Number} end
     */
    copy(value, start, end) {
        assert(end >= start);
        value = value.slice(start, end);
        this.writeBytes(value);
    }
    /**
     * Write string to buffer.
     * @param {String} value
     * @param {String?} enc - Any buffer-supported Encoding.
     */
    writeString(value, enc) {
        if (value.length === 0) {
            return;
        }
        this.offset += Buffer.byteLength(value, enc);
        this.ops.push(new WriteOp(STR, value, enc));
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
        this.writeString(value, 'hex');
    }
    /**
     * Write a string with a varint length before it.
     * @param {String}
     * @param {String?} enc - Any buffer-supported Encoding.
     */
    writeVarString(value, enc) {
        if (value.length === 0) {
            this.offset += encoding_1.Encoding.sizeVarint(0);
            this.ops.push(new WriteOp(VARINT, 0));
            return;
        }
        const size = Buffer.byteLength(value, enc);
        this.offset += encoding_1.Encoding.sizeVarint(size);
        this.offset += size;
        this.ops.push(new WriteOp(VARINT, size));
        this.ops.push(new WriteOp(STR, value, enc));
    }
    /**
     * Write a null-terminated string.
     * @param {String|Buffer}
     * @param {String?} enc - Any buffer-supported Encoding.
     */
    writeNullString(value, enc) {
        this.writeString(value, enc);
        this.writeU8(0);
    }
    /**
     * Calculate and write a checksum for the data written so far.
     */
    writeChecksum() {
        this.offset += 4;
        this.ops.push(new WriteOp(CHECKSUM));
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
        this.offset += size;
        this.ops.push(new WriteOp(FILL, value, null, size));
    }
}
exports.BufferWriter = BufferWriter;
/*
 * Helpers
 */
class WriteOp {
    constructor(type, value, enc, size) {
        this.type = type;
        this.value = value;
        this.enc = enc;
        this.size = size;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvbGliL3dyaXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRztBQUVILFlBQVksQ0FBQzs7QUFFYixpQ0FBaUM7QUFDakMseUNBQXFEO0FBQ3JELG1DQUFtQztBQUduQzs7R0FFRztBQUVILE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNkLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNmLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNqQixNQUFNLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDakIsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNkLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNmLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNqQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDZixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2YsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNkLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNoQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDZixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztBQUNuQixNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDakIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FB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