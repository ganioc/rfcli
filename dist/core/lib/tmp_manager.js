"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const error_code_1 = require("../error_code");
class TmpManager {
    constructor(options) {
        this.m_tmpDir = path.join(options.root, './tmp');
        this.m_logger = options.logger;
    }
    init(options) {
        try {
            if (options.clean) {
                fs.removeSync(this.m_tmpDir);
            }
            fs.ensureDirSync(this.m_tmpDir);
        }
        catch (e) {
            this.m_logger.error(`init tmp dir ${this.m_tmpDir} failed `, e);
            return error_code_1.ErrorCode.RESULT_EXCEPTION;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    get tmpDir() {
        return this.m_tmpDir;
    }
    getPath(name) {
        return path.join(this.m_tmpDir, name);
    }
}
exports.TmpManager = TmpManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG1wX21hbmFnZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9saWIvdG1wX21hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLDhDQUF3QztBQUd4QztJQUNJLFlBQVksT0FBK0M7UUFDdkQsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFRCxJQUFJLENBQUMsT0FBeUI7UUFDMUIsSUFBSTtZQUNBLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtnQkFDZixFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNoQztZQUNELEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ25DO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLFFBQVEsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLE9BQU8sc0JBQVMsQ0FBQyxnQkFBZ0IsQ0FBQztTQUNyQztRQUNELE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVk7UUFDaEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDMUMsQ0FBQztDQUlKO0FBN0JELGdDQTZCQyJ9