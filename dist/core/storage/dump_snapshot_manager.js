"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const error_code_1 = require("../error_code");
const dump_snapshot_1 = require("./dump_snapshot");
class StorageDumpSnapshotManager {
    constructor(options) {
        this.m_path = path.join(options.path, 'dump');
        this.m_logger = options.logger;
        this.m_readonly = !!(options && options.readonly);
    }
    recycle() {
    }
    async init() {
        if (!this.m_readonly) {
            fs.ensureDirSync(this.m_path);
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    uninit() {
        // do nothing
    }
    listSnapshots() {
        let blocks = fs.readdirSync(this.m_path);
        return blocks.map((blockHash) => {
            return new dump_snapshot_1.StorageDumpSnapshot(blockHash, this.getSnapshotFilePath(blockHash));
        });
    }
    getSnapshotFilePath(blockHash) {
        return path.join(this.m_path, blockHash);
    }
    async createSnapshot(from, blockHash) {
        this.m_logger.info(`creating snapshot ${blockHash}`);
        const snapshot = new dump_snapshot_1.StorageDumpSnapshot(blockHash, this.getSnapshotFilePath(blockHash));
        fs.copyFileSync(from.filePath, snapshot.filePath);
        return { err: error_code_1.ErrorCode.RESULT_OK, snapshot };
    }
    async getSnapshot(blockHash) {
        const snapshot = new dump_snapshot_1.StorageDumpSnapshot(blockHash, this.getSnapshotFilePath(blockHash));
        if (snapshot.exists()) {
            return { err: error_code_1.ErrorCode.RESULT_OK, snapshot };
        }
        else {
            return { err: error_code_1.ErrorCode.RESULT_NOT_FOUND };
        }
    }
    releaseSnapshot(blockHash) {
    }
    removeSnapshot(blockHash) {
        const snapshot = new dump_snapshot_1.StorageDumpSnapshot(blockHash, this.getSnapshotFilePath(blockHash));
        try {
            fs.unlinkSync(snapshot.filePath);
        }
        catch (e) {
            this.m_logger.error(`removeSnapshot ${blockHash} `, e);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
}
exports.StorageDumpSnapshotManager = StorageDumpSnapshotManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtcF9zbmFwc2hvdF9tYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvc3RvcmFnZS9kdW1wX3NuYXBzaG90X21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBRS9CLDhDQUEwQztBQUUxQyxtREFBK0U7QUFHL0U7SUFDSSxZQUFZLE9BQW1FO1FBQzNFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUtNLE9BQU87SUFFZCxDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQixFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNqQztRQUVELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELE1BQU07UUFDRixhQUFhO0lBQ2pCLENBQUM7SUFFTSxhQUFhO1FBQ2hCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO1lBQzVCLE9BQU8sSUFBSSxtQ0FBbUIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sbUJBQW1CLENBQUMsU0FBaUI7UUFDeEMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVNLEtBQUssQ0FBQyxjQUFjLENBQUMsSUFBYSxFQUFFLFNBQWlCO1FBQ3hELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sUUFBUSxHQUFHLElBQUksbUNBQW1CLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEQsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRU0sS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFpQjtRQUN0QyxNQUFNLFFBQVEsR0FBRyxJQUFJLG1DQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNuQixPQUFPLEVBQUUsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDO1NBQ2pEO2FBQU07WUFDSCxPQUFPLEVBQUUsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUM5QztJQUNMLENBQUM7SUFFTSxlQUFlLENBQUMsU0FBaUI7SUFFeEMsQ0FBQztJQUVNLGNBQWMsQ0FBQyxTQUFpQjtRQUNuQyxNQUFNLFFBQVEsR0FBRyxJQUFJLG1DQUFtQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJO1lBQ0EsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDcEM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGtCQUFrQixTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RCxPQUFPLHNCQUFTLENBQUMsZ0JBQWdCLENBQUM7U0FDckM7UUFFRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7Q0FDSjtBQXBFRCxnRUFvRUMifQ==