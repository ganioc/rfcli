"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const transaction_1 = require("./transaction");
const serializable_1 = require("../serializable");
const error_code_1 = require("../error_code");
const merkle = require("../lib/merkle");
const encoding_1 = require("../lib/encoding");
const assert = require("assert");
const digest = require('../lib/digest');
class BlockHeader extends serializable_1.SerializableWithHash {
    constructor() {
        super();
        this.m_number = 0;
        this.m_storageHash = encoding_1.Encoding.NULL_HASH;
        this.m_preBlockHash = encoding_1.Encoding.NULL_HASH;
        this.m_receiptHash = encoding_1.Encoding.NULL_HASH;
        this.m_merkleRoot = encoding_1.Encoding.NULL_HASH;
        this.m_timestamp = -1;
    }
    get number() {
        return this.m_number;
    }
    get storageHash() {
        return this.m_storageHash;
    }
    set storageHash(h) {
        this.m_storageHash = h;
    }
    get preBlockHash() {
        return this.m_preBlockHash;
    }
    get timestamp() {
        return this.m_timestamp;
    }
    set timestamp(n) {
        this.m_timestamp = n;
    }
    isPreBlock(header) {
        return (this.m_number + 1 === header.m_number) && (this.m_hash === header.m_preBlockHash);
    }
    setPreBlock(header) {
        if (header) {
            this.m_number = header.m_number + 1;
            this.m_preBlockHash = header.hash;
        }
        else {
            // gensis block
            this.m_number = 0;
            this.m_preBlockHash = encoding_1.Encoding.NULL_HASH;
        }
    }
    get merkleRoot() {
        return this.m_merkleRoot;
    }
    hasTransaction(txHash) {
        // TODO: find hash from txHash
        return false;
    }
    _genMerkleRoot(txs) {
        const leaves = [];
        for (const tx of txs) {
            leaves.push(Buffer.from(tx.hash, 'hex'));
        }
        const [root, malleated] = merkle.createRoot(leaves);
        if (malleated) {
            return encoding_1.Encoding.NULL_HASH;
        }
        return root.toString('hex');
    }
    _genReceiptHash(receipts) {
        if (!receipts.length) {
            return encoding_1.Encoding.NULL_HASH;
        }
        let writer = new serializable_1.BufferWriter();
        for (const receipt of receipts) {
            receipt.encode(writer);
        }
        return digest.hash256(writer.render()).toString('hex');
    }
    /**
     * virtual
     * verify hash here
     */
    async verify(chain) {
        return { err: error_code_1.ErrorCode.RESULT_OK, valid: true };
    }
    verifyContent(content) {
        if (this.m_merkleRoot !== this._genMerkleRoot(content.transactions)) {
            return false;
        }
        if (this.m_receiptHash !== this._genReceiptHash(content.receipts)) {
            return false;
        }
        return true;
    }
    updateContent(content) {
        this.m_merkleRoot = this._genMerkleRoot(content.transactions);
        this.m_receiptHash = this._genReceiptHash(content.receipts);
    }
    _encodeHashContent(writer) {
        try {
            writer.writeU32(this.m_number);
            writer.writeI32(this.m_timestamp);
            writer.writeHash(this.m_merkleRoot);
            writer.writeHash(this.m_storageHash);
            writer.writeHash(this.m_receiptHash);
            writer.writeHash(this.m_preBlockHash);
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    _decodeHashContent(reader) {
        try {
            this.m_number = reader.readU32();
            this.m_timestamp = reader.readI32();
            this.m_merkleRoot = reader.readHash('hex');
            this.m_storageHash = reader.readHash('hex');
            this.m_receiptHash = reader.readHash('hex');
            this.m_preBlockHash = reader.readHash('hex');
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    stringify() {
        let obj = super.stringify();
        obj.number = this.number;
        obj.timestamp = this.timestamp;
        obj.preBlock = this.preBlockHash;
        obj.merkleRoot = this.merkleRoot;
        obj.storageHash = this.m_storageHash;
        obj.m_receiptHash = this.m_receiptHash;
        return obj;
    }
}
exports.BlockHeader = BlockHeader;
class BlockContent {
    constructor(transactionType, receiptType) {
        this.m_transactions = new Array();
        this.m_preBlockEventReceipts = new Array();
        this.m_txReceipts = new Map();
        this.m_postBlockEventReceipts = new Array();
        this.m_receipts = new Array();
        this.m_transactionType = transactionType;
        this.m_receiptType = receiptType;
    }
    get transactions() {
        const t = this.m_transactions;
        return t;
    }
    get receipts() {
        const r = this.m_receipts;
        return r;
    }
    get preBlockEventReceipts() {
        const r = this.m_preBlockEventReceipts;
        return r;
    }
    get transactionReceipts() {
        const r = this.m_txReceipts;
        return r;
    }
    get postBlockEventReceipts() {
        const r = this.m_postBlockEventReceipts;
        return r;
    }
    get eventLogs() {
        let logs = [];
        for (let r of this.m_receipts) {
            logs.push(...r.eventLogs);
        }
        return logs;
    }
    hasTransaction(txHash) {
        for (const tx of this.m_transactions) {
            if (tx.hash === txHash) {
                return true;
            }
        }
        return false;
    }
    getTransaction(arg) {
        if (typeof (arg) === 'string') {
            for (const tx of this.m_transactions) {
                if (tx.hash === arg) {
                    return tx;
                }
            }
        }
        else if (typeof (arg) === 'number') {
            if (arg >= 0 && arg < this.m_transactions.length) {
                return this.m_transactions[arg];
            }
        }
        return null;
    }
    getReceipt(options) {
        if (util_1.isString(options)) {
            return this.m_txReceipts.get(options);
        }
        else {
            if (options.sourceType === transaction_1.ReceiptSourceType.preBlockEvent) {
                return this.m_preBlockEventReceipts[options.eventIndex];
            }
            else if (options.sourceType === transaction_1.ReceiptSourceType.postBlockEvent) {
                return this.m_postBlockEventReceipts[options.eventIndex];
            }
            else {
                assert(false, `invalid receipt source type ${options.sourceType}`);
                return undefined;
            }
        }
    }
    addTransaction(tx) {
        this.m_transactions.push(tx);
    }
    setReceipts(receipts) {
        let txReceipts = new Map();
        let txReceiptsArr = [];
        let preBlockEventReceipts = [];
        let postBlockEventReceipts = [];
        for (let r of receipts) {
            if (r.sourceType === transaction_1.ReceiptSourceType.transaction) {
                txReceipts.set(r.transactionHash, r);
                txReceiptsArr.push(r);
            }
            else if (r.sourceType === transaction_1.ReceiptSourceType.preBlockEvent) {
                preBlockEventReceipts.push(r);
            }
            else if (r.sourceType === transaction_1.ReceiptSourceType.postBlockEvent) {
                postBlockEventReceipts.push(r);
            }
            else {
                assert(false, `invalid receipt source type ${r.sourceType}`);
                return;
            }
        }
        this.m_txReceipts = txReceipts;
        this.m_preBlockEventReceipts = preBlockEventReceipts;
        this.m_postBlockEventReceipts = postBlockEventReceipts;
        let _receipts = [];
        _receipts.push(...preBlockEventReceipts);
        _receipts.push(...txReceiptsArr);
        _receipts.push(...postBlockEventReceipts);
        this.m_receipts = _receipts;
    }
    encode(writer) {
        try {
            writer.writeU16(this.m_transactions.length);
            for (let tx of this.m_transactions) {
                const err = tx.encode(writer);
                if (err) {
                    return err;
                }
            }
            const receiptLength = this.m_txReceipts.size
                + this.m_preBlockEventReceipts.length
                + this.m_postBlockEventReceipts.length;
            if (receiptLength) {
                if (this.m_txReceipts.size !== this.m_transactions.length) {
                    return error_code_1.ErrorCode.RESULT_INVALID_BLOCK;
                }
                writer.writeU16(receiptLength);
                for (let tx of this.m_transactions) {
                    let r = this.m_txReceipts.get(tx.hash);
                    assert(r);
                    const err = r.encode(writer);
                    if (err) {
                        return err;
                    }
                }
                for (let r of this.m_preBlockEventReceipts) {
                    const err = r.encode(writer);
                    if (err) {
                        return err;
                    }
                }
                for (let r of this.m_postBlockEventReceipts) {
                    const err = r.encode(writer);
                    if (err) {
                        return err;
                    }
                }
            }
            else {
                writer.writeU16(0);
            }
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    decode(reader) {
        this.m_transactions = [];
        this.m_txReceipts = new Map();
        let txCount;
        try {
            txCount = reader.readU16();
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        for (let ix = 0; ix < txCount; ++ix) {
            let tx = new this.m_transactionType();
            let err = tx.decode(reader);
            if (err !== error_code_1.ErrorCode.RESULT_OK) {
                return err;
            }
            this.m_transactions.push(tx);
        }
        const rs = reader.readU16();
        let receipts = [];
        if (rs) {
            for (let ix = 0; ix < txCount; ++ix) {
                let receipt = new this.m_receiptType();
                const err = receipt.decode(reader);
                if (err !== error_code_1.ErrorCode.RESULT_OK) {
                    return err;
                }
                receipts.push(receipt);
            }
            for (let ix = 0; ix < rs - txCount; ++ix) {
                let receipt = new transaction_1.Receipt();
                const err = receipt.decode(reader);
                if (err !== error_code_1.ErrorCode.RESULT_OK) {
                    return err;
                }
                receipts.push(receipt);
            }
        }
        this.setReceipts(receipts);
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.BlockContent = BlockContent;
class Block {
    constructor(options) {
        this.m_transactionType = options.transactionType;
        this.m_headerType = options.headerType;
        this.m_header = new this.m_headerType();
        this.m_receiptType = options.receiptType;
        if (options.header) {
            let writer = new serializable_1.BufferWriter();
            let err = options.header.encode(writer);
            assert(!err, `encode header failed with err ${err}`);
            let reader = new serializable_1.BufferReader(writer.render());
            err = this.m_header.decode(reader);
            assert(!err, `clone header failed with err ${err}`);
        }
        this.m_content = new BlockContent(this.m_transactionType, this.m_receiptType);
    }
    clone() {
        let writer = new serializable_1.BufferWriter();
        let err = this.encode(writer);
        assert(!err, `encode block failed ${err}`);
        let reader = new serializable_1.BufferReader(writer.render());
        let newBlock = new Block({
            headerType: this.m_headerType,
            transactionType: this.m_transactionType,
            receiptType: this.m_receiptType,
        });
        err = newBlock.decode(reader);
        assert(!err, `clone block ${this.m_header.hash} failed for ${err}`);
        return newBlock;
    }
    get header() {
        return this.m_header;
    }
    get content() {
        return this.m_content;
    }
    get hash() {
        return this.m_header.hash;
    }
    get number() {
        return this.m_header.number;
    }
    encode(writer) {
        let err = this.m_header.encode(writer);
        if (err) {
            return err;
        }
        return this.m_content.encode(writer);
    }
    decode(reader) {
        let err = this.m_header.decode(reader);
        if (err !== error_code_1.ErrorCode.RESULT_OK) {
            return err;
        }
        return this.m_content.decode(reader);
    }
    verify() {
        // 验证content hash
        return this.m_header.verifyContent(this.m_content);
    }
}
exports.Block = Block;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9ibG9jay9ibG9jay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUE4QjtBQUM5QiwrQ0FBa0Y7QUFDbEYsa0RBQWlHO0FBQ2pHLDhDQUEwQztBQUMxQyx3Q0FBd0M7QUFDeEMsOENBQTJDO0FBQzNDLGlDQUFpQztBQUNqQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFFeEMsaUJBQXlCLFNBQVEsbUNBQW9CO0lBVWpEO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLG1CQUFRLENBQUMsU0FBUyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsbUJBQVEsQ0FBQyxTQUFTLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsR0FBRyxtQkFBUSxDQUFDLFNBQVMsQ0FBQztRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLG1CQUFRLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLFdBQVcsQ0FBQyxDQUFTO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksU0FBUztRQUNULE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxTQUFTLENBQUMsQ0FB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