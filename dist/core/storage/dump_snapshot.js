"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const error_code_1 = require("../error_code");
const digest = require('../lib/digest');
class StorageDumpSnapshot {
    constructor(blockHash, filePath) {
        this.m_blockHash = blockHash;
        this.m_filePath = filePath;
    }
    get blockHash() {
        return this.m_blockHash;
    }
    get filePath() {
        return this.m_filePath;
    }
    exists() {
        return fs.existsSync(this.m_filePath);
    }
    async messageDigest() {
        let buf = await fs.readFile(this.m_filePath);
        let hash = digest.hash256(buf).toString('hex');
        return { err: error_code_1.ErrorCode.RESULT_OK, value: hash };
    }
    remove() {
        if (fs.existsSync(this.filePath)) {
            fs.unlinkSync(this.filePath);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        return error_code_1.ErrorCode.RESULT_NOT_FOUND;
    }
}
exports.StorageDumpSnapshot = StorageDumpSnapshot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtcF9zbmFwc2hvdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3N0b3JhZ2UvZHVtcF9zbmFwc2hvdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLCtCQUErQjtBQUUvQiw4Q0FBMEM7QUFLMUMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBS3hDO0lBQ0ksWUFBWSxTQUFpQixFQUFFLFFBQWdCO1FBQzNDLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUSxDQUFDO0lBQy9CLENBQUM7SUFLRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUFhO1FBQ3RCLElBQUksR0FBRyxHQUFHLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDN0MsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsT0FBTyxFQUFFLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDckQsQ0FBQztJQUVNLE1BQU07UUFDVCxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVMsQ0FBQyxFQUFFO1lBQy9CLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVMsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7U0FDOUI7UUFDRCxPQUFPLHNCQUFTLENBQUMsZ0JBQWdCLENBQUM7SUFDdEMsQ0FBQztDQUNKO0FBbENELGtEQWtDQyJ9