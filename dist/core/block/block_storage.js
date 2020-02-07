"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const block_1 = require("./block");
const serializable_1 = require("../serializable");
const fs = require("fs-extra");
const path = require("path");
const client_1 = require("../../client");
class BlockStorage {
    constructor(options) {
        this.m_path = path.join(options.path, 'Block');
        this.m_blockHeaderType = options.blockHeaderType;
        this.m_transactionType = options.transactionType;
        this.m_receiptType = options.receiptType;
        this.m_logger = options.logger;
        this.m_readonly = !!options.readonly;
    }
    init() {
        if (!this.m_readonly) {
            fs.mkdirsSync(this.m_path);
        }
        return client_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        // do nothing
    }
    has(blockHash) {
        return fs.existsSync(this._pathOfBlock(blockHash));
    }
    _pathOfBlock(hash) {
        return path.join(this.m_path, hash);
    }
    get(blockHash) {
        let blockRaw;
        try {
            blockRaw = fs.readFileSync(this._pathOfBlock(blockHash));
        }
        catch (error) {
            this.m_logger.warn(`readBlockFile ${this._pathOfBlock(blockHash)} failed.`);
        }
        if (blockRaw) {
            let block = new block_1.Block({ headerType: this.m_blockHeaderType, transactionType: this.m_transactionType, receiptType: this.m_receiptType });
            let err = block.decode(new serializable_1.BufferReader(blockRaw));
            if (err) {
                this.m_logger.error(`load block ${blockHash} from storage failed!`);
                return undefined;
            }
            return block;
        }
        else {
            return undefined;
        }
    }
    _add(hash, blockRaw) {
        fs.writeFileSync(this._pathOfBlock(hash), blockRaw);
    }
    add(block) {
        if (this.m_readonly) {
            return client_1.ErrorCode.RESULT_NOT_SUPPORT;
        }
        let hash = block.hash;
        if (this.has(hash)) {
            return client_1.ErrorCode.RESULT_ALREADY_EXIST;
        }
        let writer = new serializable_1.BufferWriter();
        let err = block.encode(writer);
        if (err) {
            this.m_logger.error(`invalid block `, block);
            return err;
        }
        this._add(hash, writer.render());
        return client_1.ErrorCode.RESULT_OK;
    }
    getSize(blockHash) {
        if (!this.has(blockHash)) {
            return -1;
        }
        let stat = fs.statSync(this._pathOfBlock(blockHash));
        return stat.size;
    }
}
exports.BlockStorage = BlockStorage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tfc3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2Jsb2NrL2Jsb2NrX3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtQ0FBMkQ7QUFDM0Qsa0RBQTZEO0FBRzdELCtCQUErQjtBQUMvQiw2QkFBNkI7QUFDN0IseUNBQXlDO0FBVXpDO0lBQ0ksWUFBWSxPQU9YO1FBQ0csSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7UUFDakQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUM7UUFDakQsSUFBSSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ3pDLENBQUM7SUFTTSxJQUFJO1FBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDOUI7UUFDRCxPQUFPLGtCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFTSxNQUFNO1FBQ1QsYUFBYTtJQUNqQixDQUFDO0lBRU0sR0FBRyxDQUFDLFNBQWlCO1FBQ3hCLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVPLFlBQVksQ0FBQyxJQUFZO1FBQzdCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTSxHQUFHLENBQUMsU0FBaUI7UUFDeEIsSUFBSSxRQUFRLENBQUM7UUFDYixJQUFJO1lBQ0EsUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQzVEO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDL0U7UUFFRCxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksS0FBSyxHQUFHLElBQUksYUFBSyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztZQUN4SSxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksMkJBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ25ELElBQUksR0FBRyxFQUFFO2dCQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGNBQWMsU0FBUyx1QkFBdUIsQ0FBQyxDQUFDO2dCQUNwRSxPQUFPLFNBQVMsQ0FBQzthQUNwQjtZQUNELE9BQU8sS0FBSyxDQUFDO1NBQ2hCO2FBQU07WUFDSCxPQUFPLFNBQVMsQ0FBQztTQUNwQjtJQUNMLENBQUM7SUFFTyxJQUFJLENBQUMsSUFBWSxFQUFFLFFBQWdCO1FBQ3ZDLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBRU0sR0FBRyxDQUFDLEtBQVk7UUFDbkIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLE9BQU8sa0JBQVMsQ0FBQyxrQkFBa0IsQ0FBQztTQUN2QztRQUNELElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2hCLE9BQU8sa0JBQVMsQ0FBQyxvQkFBb0IsQ0FBQztTQUN6QztRQUNELElBQUksTUFBTSxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO1FBQ2hDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0IsSUFBSSxHQUFHLEVBQUU7WUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3QyxPQUFPLEdBQUcsQ0FBQztTQUNkO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDakMsT0FBTyxrQkFBUyxDQUFDLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRU0sT0FBTyxDQUFDLFNBQWlCO1FBQzVCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjtRQUNELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3JELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNyQixDQUFDO0NBQ0o7QUE3RkQsb0NBNkZDIn0=