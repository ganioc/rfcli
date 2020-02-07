/*!
 * encoding.js - encoding utils for bcoin
 * Copyright (c) 2014-2015, Fedor Indutny (MIT License)
 * Copyright (c) 2014-2017, Christopher Jeffrey (MIT License).
 * https://github.com/bcoin-org/bcoin
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module utils/encoding
 */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;
class Encoding {
    /**
     * Read uint64le as a js number.
     * @param {Buffer} data
     * @param {Number} off
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    static readU64(data, off) {
        const hi = data.readUInt32LE(off + 4, true);
        const lo = data.readUInt32LE(off, true);
        enforce((hi & 0xffe00000) === 0, off, 'Number exceeds 2^53-1');
        return hi * 0x100000000 + lo;
    }
    /**
     * Read uint64be as a js number.
     * @param {Buffer} data
     * @param {Number} off
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    static readU64BE(data, off) {
        const hi = data.readUInt32BE(off, true);
        const lo = data.readUInt32BE(off + 4, true);
        enforce((hi & 0xffe00000) === 0, off, 'Number exceeds 2^53-1');
        return hi * 0x100000000 + lo;
    }
    /**
     * Read int64be as a js number.
     * @param {Buffer} data
     * @param {Number} off
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    static readI64(data, off) {
        const hi = data.readInt32LE(off + 4, true);
        const lo = data.readUInt32LE(off, true);
        enforce(isSafe(hi, lo), 'Number exceeds 2^53-1');
        return hi * 0x100000000 + lo;
    }
    /**
     * Read int64be as a js number.
     * @param {Buffer} data
     * @param {Number} off
     * @returns {Number}
     * @throws on num > MAX_SAFE_INTEGER
     */
    static readI64BE(data, off) {
        const hi = data.readInt32BE(off, true);
        const lo = data.readUInt32BE(off + 4, true);
        enforce(isSafe(hi, lo), 'Number exceeds 2^53-1');
        return hi * 0x100000000 + lo;
    }
    /**
     * Write a javascript number as a uint64le.
     * @param {Buffer} dst
     * @param {Number} num
     * @param {Number} off
     * @returns {Number} Buffer offset.
     * @throws on num > MAX_SAFE_INTEGER
     */
    static writeU64(dst, num, off) {
        return write64(dst, num, off, false);
    }
    /**
     * Write a javascript number as a uint64be.
     * @param {Buffer} dst
     * @param {Number} num
     * @param {Number} off
     * @returns {Number} Buffer offset.
     * @throws on num > MAX_SAFE_INTEGER
     */
    static writeU64BE(dst, num, off) {
        return write64(dst, num, off, true);
    }
    /**
     * Write a javascript number as an int64le.
     * @param {Buffer} dst
     * @param {Number} num
     * @param {Number} off
     * @returns {Number} Buffer offset.
     * @throws on num > MAX_SAFE_INTEGER
     */
    static writeI64(dst, num, off) {
        return write64(dst, num, off, false);
    }
    /**
     * Write a javascript number as an int64be.
     * @param {Buffer} dst
     * @param {Number} num
     * @param {Number} off
     * @returns {Number} Buffer offset.
     * @throws on num > MAX_SAFE_INTEGER
     */
    static writeI64BE(dst, num, off) {
        return write64(dst, num, off, true);
    }
    /**
     * Read a varint.
     * @param {Buffer} data
     * @param {Number} off
     * @returns {Object}
     */
    static readVarint(data, off) {
        let value, size;
        assert(off < data.length, off);
        switch (data[off]) {
            case 0xff:
                size = 9;
                assert(off + size <= data.length, off);
                value = Encoding.readU64(data, off + 1);
                enforce(value > 0xffffffff, off, 'Non-canonical varint');
                break;
            case 0xfe:
                size = 5;
                assert(off + size <= data.length, off);
                value = data.readUInt32LE(off + 1, true);
                enforce(value > 0xffff, off, 'Non-canonical varint');
                break;
            case 0xfd:
                size = 3;
                assert(off + size <= data.length, off);
                value = data[off + 1] | (data[off + 2] << 8);
                enforce(value >= 0xfd, off, 'Non-canonical varint');
                break;
            default:
                size = 1;
                value = data[off];
                break;
        }
        return new Varint(size, value);
    }
    /**
     * Write a varint.
     * @param {Buffer} dst
     * @param {Number} num
     * @param {Number} off
     * @returns {Number} Buffer offset.
     */
    static writeVarint(dst, num, off) {
        if (num < 0xfd) {
            dst[off++] = num & 0xff;
            return off;
        }
        if (num <= 0xffff) {
            dst[off++] = 0xfd;
            dst[off++] = num & 0xff;
            dst[off++] = (num >> 8) & 0xff;
            return off;
        }
        if (num <= 0xffffffff) {
            dst[off++] = 0xfe;
            dst[off++] = num & 0xff;
            dst[off++] = (num >> 8) & 0xff;
            dst[off++] = (num >> 16) & 0xff;
            dst[off++] = num >>> 24;
            return off;
        }
        dst[off++] = 0xff;
        off = Encoding.writeU64(dst, num, off);
        return off;
    }
    /**
     * Calculate size of varint.
     * @param {Number} num
     * @returns {Number} size
     */
    static sizeVarint(num) {
        if (num < 0xfd) {
            return 1;
        }
        if (num <= 0xffff) {
            return 3;
        }
        if (num <= 0xffffffff) {
            return 5;
        }
        return 9;
    }
    /**
     * Read a varint (type 2).
     * @param {Buffer} data
     * @param {Number} off
     * @returns {Object}
     */
    static readVarint2(data, off) {
        let num = 0;
        let size = 0;
        for (;;) {
            assert(off < data.length, off);
            const ch = data[off++];
            size++;
            // Number.MAX_SAFE_INTEGER >>> 7
            enforce(num <= 0x3fffffffffff - (ch & 0x7f), off, 'Number exceeds 2^53-1');
            // num = (num << 7) | (ch & 0x7f);
            num = (num * 0x80) + (ch & 0x7f);
            if ((ch & 0x80) === 0) {
                break;
            }
            enforce(num !== MAX_SAFE_INTEGER, off, 'Number exceeds 2^53-1');
            num++;
        }
        return new Varint(size, num);
    }
    /**
     * Write a varint (type 2).
     * @param {Buffer} dst
     * @param {Number} num
     * @param {Number} off
     * @returns {Number} Buffer offset.
     */
    static writeVarint2(dst, num, off) {
        const tmp = [];
        let len = 0;
        for (;;) {
            tmp[len] = (num & 0x7f) | (len ? 0x80 : 0x00);
            if (num <= 0x7f) {
                break;
            }
            // num = (num >>> 7) - 1;
            num = ((num - (num % 0x80)) / 0x80) - 1;
            len++;
        }
        assert(off + len + 1 <= dst.length, off);
        do {
            dst[off++] = tmp[len];
        } while (len--);
        return off;
    }
    /**
     * Calculate size of varint (type 2).
     * @param {Number} num
     * @returns {Number} size
     */
    static sizeVarint2(num) {
        let size = 0;
        for (;;) {
            size++;
            if (num <= 0x7f) {
                break;
            }
            // num = (num >>> 7) - 1;
            num = ((num - (num % 0x80)) / 0x80) - 1;
        }
        return size;
    }
    /**
     * Serialize number as a u8.
     * @param {Number} num
     * @returns {Buffer}
     */
    static U8(num) {
        const data = Buffer.allocUnsafe(1);
        data[0] = num >>> 0;
        return data;
    }
    /**
     * Serialize number as a u32le.
     * @param {Number} num
     * @returns {Buffer}
     */
    static U32(num) {
        const data = Buffer.allocUnsafe(4);
        data.writeUInt32LE(num, 0, true);
        return data;
    }
    /**
     * Serialize number as a u32be.
     * @param {Number} num
     * @returns {Buffer}
     */
    static U32BE(num) {
        const data = Buffer.allocUnsafe(4);
        data.writeUInt32BE(num, 0, true);
        return data;
    }
    /**
     * Get size of varint-prefixed bytes.
     * @param {Buffer} data
     * @returns {Number}
     */
    static sizeVarBytes(data) {
        return Encoding.sizeVarint(data.length) + data.length;
    }
    /**
     * Get size of varint-prefixed length.
     * @param {Number} len
     * @returns {Number}
     */
    static sizeVarlen(len) {
        return Encoding.sizeVarint(len) + len;
    }
    /**
     * Get size of varint-prefixed string.
     * @param {String} str
     * @returns {Number}
     */
    static sizeVarString(str, enc) {
        if (typeof str !== 'string') {
            return Encoding.sizeVarBytes(str);
        }
        const len = Buffer.byteLength(str, enc);
        return Encoding.sizeVarint(len) + len;
    }
}
/**
 * An empty buffer.
 * @const {Buffer}
 * @default
 */
Encoding.DUMMY = Buffer.from([0]);
/**
 * A hash of all zeroes with a `1` at the
 * end (used for the SIGHASH_SINGLE bug).
 * @const {Buffer}
 * @default
 */
Encoding.ONE_HASH = Buffer.from('0100000000000000000000000000000000000000000000000000000000000000', 'hex');
/**
 * A hash of all zeroes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_HASH = Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
/**
 * A hash of all 0xff.
 * @const {Buffer}
 * @default
 */
Encoding.MAX_HASH = Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex');
/**
 * A hash of all zeroes.
 * @const {String}
 * @default
 */
Encoding.NULL_HASH = '0000000000000000000000000000000000000000000000000000000000000000';
/**
 * A hash of all 0xff.
 * @const {String}
 * @default
 */
Encoding.HIGH_HASH = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
/**
 * A hash of all zeroes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_HASH160 = Buffer.from('0000000000000000000000000000000000000000', 'hex');
/**
 * A hash of all 0xff.
 * @const {String}
 * @default
 */
Encoding.MAX_HASH160 = Buffer.from('ffffffffffffffffffffffffffffffffffffffff', 'hex');
/**
 * A hash of all zeroes.
 * @const {String}
 * @default
 */
Encoding.NULL_HASH160 = '0000000000000000000000000000000000000000';
/**
 * A hash of all 0xff.
 * @const {String}
 * @default
 */
Encoding.HIGH_HASH160 = 'ffffffffffffffffffffffffffffffffffffffff';
/**
 * A compressed pubkey of all zeroes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_KEY = Buffer.from('000000000000000000000000000000000000000000000000000000000000000000', 'hex');
/**
 * A 73 byte signature of all zeroes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_SIG = Buffer.from(''
    + '0000000000000000000000000000000000000000000000000000000000000000'
    + '0000000000000000000000000000000000000000000000000000000000000000'
    + '000000000000000000', 'hex');
/**
 * A 64 byte signature of all zeroes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_SIG64 = Buffer.from(''
    + '0000000000000000000000000000000000000000000000000000000000000000'
    + '0000000000000000000000000000000000000000000000000000000000000000', 'hex');
/**
 * 4 zero bytes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_U32 = Buffer.from('00000000', 'hex');
/**
 * 8 zero bytes.
 * @const {Buffer}
 * @default
 */
Encoding.ZERO_U64 = Buffer.from('0000000000000000', 'hex');
exports.Encoding = Encoding;
/*
 * Helpers
 */
function isSafe(hi, lo) {
    if (hi < 0) {
        hi = ~hi;
        if (lo === 0) {
            hi += 1;
        }
    }
    return (hi & 0xffe00000) === 0;
}
function write64(dst, num, off, be) {
    let neg = false;
    if (num < 0) {
        num = -num;
        neg = true;
    }
    let hi = (num * (1 / 0x100000000)) | 0;
    let lo = num | 0;
    if (neg) {
        if (lo === 0) {
            hi = (~hi + 1) | 0;
        }
        else {
            hi = ~hi;
            lo = ~lo + 1;
        }
    }
    if (be) {
        off = dst.writeInt32BE(hi, off, true);
        off = dst.writeInt32BE(lo, off, true);
    }
    else {
        off = dst.writeInt32LE(lo, off, true);
        off = dst.writeInt32LE(hi, off, true);
    }
    return off;
}
/**
 * EncodingError
 * @constructor
 * @param {Number} offset
 * @param {String} reason
 */
class EncodingError extends Error {
    constructor(offset, reason, start) {
        super();
        this.type = 'EncodingError';
        this.message = `${reason} (offset=${offset}).`;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, start || EncodingError);
        }
    }
}
exports.EncodingError = EncodingError;
class Varint {
    constructor(size, value) {
        this.size = size;
        this.value = value;
    }
}
function assert(value, offset) {
    if (!value) {
        throw new EncodingError(offset, 'Out of bounds read', assert);
    }
}
function enforce(value, offset, reason) {
    if (!value) {
        throw new EncodingError(offset, reason, enforce);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9saWIvZW5jb2RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0dBS0c7QUFFSCxZQUFZLENBQUM7O0FBRWI7O0dBRUc7QUFFSCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztBQUVqRDtJQXdKSTs7Ozs7O09BTUc7SUFFSCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ3BDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4QyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQy9ELE9BQU8sRUFBRSxHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUVILE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBWSxFQUFFLEdBQVc7UUFDdEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzVDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFDL0QsT0FBTyxFQUFFLEdBQUcsV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBRUgsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFZLEVBQUUsR0FBVztRQUNwQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDM0MsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUNqRCxPQUFPLEVBQUUsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFFSCxNQUFNLENBQUMsU0FBUyxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ3RDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sRUFBRSxHQUFHLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFFSCxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQUUsR0FBVztRQUNqRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUVILE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ25ELE9BQU8sT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBRUgsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFXLEVBQUUsR0FBVyxFQUFFLEdBQVc7UUFDakQsT0FBTyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFFSCxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQVcsRUFBRSxHQUFXLEVBQUUsR0FBVztRQUNuRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFFSCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ3ZDLElBQUksS0FBSyxFQUFFLElBQUksQ0FBQztRQUVoQixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0IsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDZixLQUFLLElBQUk7Z0JBQ0wsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxLQUFLLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUN4QyxPQUFPLENBQUMsS0FBSyxHQUFHLFVBQVUsRUFBRSxHQUFHLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDekQsTUFBTTtZQUNWLEtBQUssSUFBSTtnQkFDTCxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUNULE1BQU0sQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3pDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsTUFBTSxFQUFFLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNO1lBQ1YsS0FBSyxJQUFJO2dCQUNMLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBQ1QsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDdkMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRSxHQUFHLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDcEQsTUFBTTtZQUNWO2dCQUNJLElBQUksR0FBRyxDQUFDLENBQUM7Z0JBQ1QsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDbEIsTUFBTTtTQUNiO1FBRUQsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUVILE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ3BELElBQUksR0FBRyxHQUFHLElBQUksRUFBRTtZQUNaLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7WUFDeEIsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUVELElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtZQUNmLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNsQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMvQixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBRUQsSUFBSSxHQUFHLElBQUksVUFBVSxFQUFFO1lBQ25CLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNsQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztZQUMvQixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDaEMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQztZQUN4QixPQUFPLEdBQUcsQ0FBQztTQUNkO1FBRUQsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLEdBQUcsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdkMsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0lBRUQ7Ozs7T0FJRztJQUVILE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBVztRQUN6QixJQUFJLEdBQUcsR0FBRyxJQUFJLEVBQUU7WUFDWixPQUFPLENBQUMsQ0FBQztTQUNaO1FBRUQsSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO1lBQ2YsT0FBTyxDQUFDLENBQUM7U0FDWjtRQUVELElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRTtZQUNuQixPQUFPLENBQUMsQ0FBQztTQUNaO1FBRUQsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFFSCxNQUFNLENBQUMsV0FBVyxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ3hDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztRQUViLFNBQVU7WUFDTixNQUFNLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFFL0IsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdkIsSUFBSSxFQUFFLENBQUM7WUFFUCxnQ0FBZ0M7WUFDaEMsT0FBTyxDQUFDLEdBQUcsSUFBSSxjQUFjLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFFM0Usa0NBQWtDO1lBQ2xDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztZQUVqQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbkIsTUFBTTthQUNUO1lBRUQsT0FBTyxDQUFDLEdBQUcsS0FBSyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUNoRSxHQUFHLEVBQUUsQ0FBQztTQUNUO1FBRUQsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUVILE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBVyxFQUFFLEdBQVcsRUFBRSxHQUFXO1FBQ3JELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUVmLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUVaLFNBQVU7WUFDTixHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNiLE1BQU07YUFDVDtZQUVELHlCQUF5QjtZQUN6QixHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4QyxHQUFHLEVBQUUsQ0FBQztTQUNUO1FBRUQsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFekMsR0FBRztZQUNDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QixRQUFRLEdBQUcsRUFBRSxFQUFFO1FBRWhCLE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQVc7UUFDMUIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBRWIsU0FBVTtZQUNOLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNiLE1BQU07YUFDVDtZQUVELHlCQUF5QjtZQUN6QixHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7OztPQUlHO0lBRUgsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFXO1FBQ2pCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDcEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQVc7UUFDbEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQVc7UUFDcEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakMsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxNQUFNLENBQUMsWUFBWSxDQUFDLElBQVk7UUFDNUIsT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQzFELENBQUM7SUFFRDs7OztPQUlHO0lBRUgsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFXO1FBQ3pCLE9BQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDMUMsQ0FBQztJQUVEOzs7O09BSUc7SUFFSCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQVcsRUFBRSxHQUFZO1FBQzFDLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3pCLE9BQU8sUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNyQztRQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLE9BQU8sUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDMUMsQ0FBQzs7QUF0Z0JEOzs7O0dBSUc7QUFFSSxjQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFaEM7Ozs7O0dBS0c7QUFFSSxpQkFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQ3pCLGtFQUFrRSxFQUNsRSxLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxrQkFBUyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQzFCLGtFQUFrRSxFQUNsRSxLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxpQkFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQ3pCLGtFQUFrRSxFQUNsRSxLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxrQkFBUyxHQUNaLGtFQUFrRSxDQUFDO0FBRXZFOzs7O0dBSUc7QUFFSSxrQkFBUyxHQUNaLGtFQUFrRSxDQUFDO0FBRXZFOzs7O0dBSUc7QUFFSSxxQkFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQzdCLDBDQUEwQyxFQUMxQyxLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxvQkFBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQzVCLDBDQUEwQyxFQUMxQyxLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxxQkFBWSxHQUFHLDBDQUEwQyxDQUFDO0FBRWpFOzs7O0dBSUc7QUFFSSxxQkFBWSxHQUFHLDBDQUEwQyxDQUFDO0FBRWpFOzs7O0dBSUc7QUFFSSxpQkFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQ3pCLG9FQUFvRSxFQUNwRSxLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxpQkFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUMxQixrRUFBa0U7TUFDbEUsa0VBQWtFO01BQ2xFLG9CQUFvQixFQUN0QixLQUFLLENBQ1IsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSSxtQkFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtNQUM1QixrRUFBa0U7TUFDbEUsa0VBQWtFLEVBQ3BFLEtBQUssQ0FDUixDQUFDO0FBRUY7Ozs7R0FJRztBQUVJLGlCQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFakQ7Ozs7R0FJRztBQUVJLGlCQUFRLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztBQXRKN0QsNEJBeWdCQztBQUVEOztHQUVHO0FBRUgsZ0JBQWdCLEVBQVUsRUFBRSxFQUFVO0lBQ2xDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTtRQUNSLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNULElBQUksRUFBRSxLQUFLLENBQUMsRUFBRTtZQUNWLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDWDtLQUVKO0lBRUQsT0FBTyxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELGlCQUFpQixHQUFXLEVBQUUsR0FBVyxFQUFFLEdBQVcsRUFBRSxFQUFXO0lBQy9ELElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztJQUVoQixJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDVCxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7UUFDWCxHQUFHLEdBQUcsSUFBSSxDQUFDO0tBQ2Q7SUFFRCxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2QyxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBRWpCLElBQUksR0FBRyxFQUFFO1FBQ0wsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ1YsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO2FBQU07WUFDSCxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDVCxFQUFFLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO0tBQ0o7SUFFRCxJQUFJLEVBQUUsRUFBRTtRQUNKLEdBQUcsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6QztTQUFNO1FBQ0gsR0FBRyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3pDO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFFSCxtQkFBMkIsU0FBUSxLQUFLO0lBRXBDLFlBQVksTUFBcUIsRUFBRSxNQUF3QixFQUFFLEtBQVc7UUFDcEUsS0FBSyxFQUFFLENBQUM7UUFFUixJQUFJLENBQUMsSUFBSSxHQUFHLGVBQWUsQ0FBQztRQUM1QixJQUFJLENBQUMsT0FBTyxHQUFHLEdBQUcsTUFBTSxZQUFZLE1BQU0sSUFBSSxDQUFDO1FBRS9DLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO1lBQ3pCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxJQUFJLGFBQWEsQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQztDQUNKO0FBWkQsc0NBWUM7QUFFRDtJQUdJLFlBQVksSUFBWSxFQUFFLEtBQWE7UUFDbkMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztDQUNKO0FBRUQsZ0JBQWdCLEtBQWMsRUFBRSxNQUFjO0lBQzFDLElBQUksQ0FBQyxLQUFLLEVBQUU7UUFDUixNQUFNLElBQUksYUFBYSxDQUFDLE1BQU0sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNqRTtBQUNMLENBQUM7QUFFRCxpQkFBaUIsS0FBYyxFQUFFLE1BQXFCLEVBQUUsTUFBZTtJQUNuRSxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1IsTUFBTSxJQUFJLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3BEO0FBQ0wsQ0FBQyJ9