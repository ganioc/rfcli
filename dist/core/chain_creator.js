"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs-extra");
const process = require("process");
const error_code_1 = require("./error_code");
const logger_util_1 = require("./lib/logger_util");
class ChainCreator {
    constructor(options) {
        this.m_instances = new Map();
        this.m_logger = logger_util_1.initLogger(options);
        this.m_networkCreator = options.networkCreator;
    }
    get networkCreator() {
        return this.m_networkCreator;
    }
    registerChainType(consesus, instance) {
        this.m_instances.set(consesus, instance);
    }
    get logger() {
        return this.m_logger;
    }
    _getTypeInstance(typeOptions) {
        let ins = this.m_instances.get(typeOptions.consensus);
        if (!ins) {
            this.m_logger.error(`chain creator has no register consensus named ${typeOptions.consensus}`);
            return undefined;
        }
        return ins;
    }
    async createGenesis(packagePath, dataDir, genesisOptions, externalHandler = false) {
        if (!path.isAbsolute(dataDir)) {
            dataDir = path.join(process.cwd(), dataDir);
        }
        if (!path.isAbsolute(packagePath)) {
            packagePath = path.join(process.cwd(), packagePath);
        }
        fs.ensureDirSync(dataDir);
        if (externalHandler) {
            let configPath = path.join(packagePath, 'config.json');
            try {
                let _config = fs.readJSONSync(configPath);
                _config['handler'] = path.join(packagePath, _config['handler']);
                fs.writeJSONSync(path.join(dataDir, 'config.json'), _config, { spaces: 4, flag: 'w' });
            }
            catch (e) {
                this.m_logger.error(`load ${configPath} failed for`, e);
            }
        }
        else {
            fs.copySync(packagePath, dataDir);
        }
        let cmir = await this.createMinerInstance(dataDir);
        if (cmir.err) {
            return { err: cmir.err };
        }
        let lcr = this._loadConfig(dataDir);
        if (lcr.err) {
            return { err: lcr.err };
        }
        let err = await cmir.miner.create(genesisOptions);
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, miner: cmir.miner };
    }
    _loadConfig(dataDir) {
        let configPath = path.join(dataDir, 'config.json');
        let constConfig;
        try {
            constConfig = fs.readJsonSync(configPath);
        }
        catch (e) {
            this.m_logger.error(`can't get config from package ${dataDir} for ${e.message}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        if (!constConfig['handler']) {
            this.m_logger.error(`can't get handler from package ${dataDir}/config.json`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let handlerPath = constConfig['handler'];
        if (!path.isAbsolute(handlerPath)) {
            handlerPath = path.join(dataDir, handlerPath);
        }
        let typeOptions = constConfig['type'];
        if (!typeOptions || !typeOptions.consensus || !typeOptions.features) {
            this.m_logger.error(`invalid type from package ${dataDir}`);
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let handler = this._loadHandler(handlerPath, typeOptions);
        if (!handler) {
            return { err: error_code_1.ErrorCode.RESULT_EXCEPTION };
        }
        let globalOptions = constConfig['global'];
        if (!globalOptions) {
            globalOptions = {};
        }
        return {
            err: error_code_1.ErrorCode.RESULT_OK,
            config: {
                handler,
                typeOptions,
                globalOptions
            }
        };
    }
    _loadHandler(handlerPath, typeOptions) {
        let instance = this._getTypeInstance(typeOptions);
        if (!instance) {
            return undefined;
        }
        let handler = instance.newHandler(this, typeOptions);
        try {
            // 兼容VSCode调试器和命令行环境，win32下handlerPath的盘符需要和process.cwd返回的盘符大小写一致
            // VScode环境下，cwd返回小写盘符，命令行环境下，cwd返回小写盘符
            let cwdPath = process.cwd().split(':', 2);
            if (cwdPath.length === 2) {
                const isLower = cwdPath[0] >= 'a' && cwdPath[0] <= 'z';
                let pathsplitter = handlerPath.split(':', 2);
                if (pathsplitter.length === 2) {
                    pathsplitter[0] = isLower ? pathsplitter[0].toLowerCase() : pathsplitter[0].toUpperCase();
                }
                handlerPath = pathsplitter.join(':');
            }
            let handlerMod = require(handlerPath);
            handlerMod.registerHandler(handler);
        }
        catch (e) {
            console.error(`handler error: ${e.message}`);
            return undefined;
        }
        return handler;
    }
    async createMinerInstance(dataDir) {
        if (!path.isAbsolute(dataDir)) {
            dataDir = path.join(process.cwd(), dataDir);
        }
        let lcr = this._loadConfig(dataDir);
        if (lcr.err) {
            return { err: lcr.err };
        }
        let instance = this._getTypeInstance(lcr.config.typeOptions);
        if (!instance) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_TYPE };
        }
        let miner = instance.newMiner(this, dataDir, lcr.config);
        let err = await miner.initComponents();
        if (err) {
            return { err };
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, miner, globalOptions: lcr.config.globalOptions };
    }
    async createChainInstance(dataDir, options) {
        if (!path.isAbsolute(dataDir)) {
            dataDir = path.join(process.cwd(), dataDir);
        }
        let lcr = this._loadConfig(dataDir);
        if (lcr.err) {
            return { err: lcr.err };
        }
        let instance = this._getTypeInstance(lcr.config.typeOptions);
        if (!instance) {
            return { err: error_code_1.ErrorCode.RESULT_INVALID_TYPE };
        }
        let chain = instance.newChain(this, dataDir, lcr.config);
        if (options.initComponents) {
            let err = await chain.initComponents({ readonly: options.readonly });
            if (err) {
                return { err };
            }
        }
        return { err: error_code_1.ErrorCode.RESULT_OK, chain };
    }
}
exports.ChainCreator = ChainCreator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5fY3JlYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb3JlL2NoYWluX2NyZWF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLG1DQUFtQztBQUNuQyw2Q0FBeUM7QUFDekMsbURBQThFO0FBYTlFO0lBS0ksWUFBWSxPQUF5RDtRQUg3RCxnQkFBVyxHQUFtQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBSTVELElBQUksQ0FBQyxRQUFRLEdBQUcsd0JBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztJQUVuRCxDQUFDO0lBRUQsSUFBVyxjQUFjO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLFFBQTJCO1FBQ2xFLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsSUFBVyxNQUFNO1FBQ2IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFUyxnQkFBZ0IsQ0FBQyxXQUE2QjtRQUNwRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNOLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLGlEQUFpRCxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUM5RixPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUFhLENBQUMsV0FBbUIsRUFBRSxPQUFlLEVBQUUsY0FBbUIsRUFBRSxlQUFlLEdBQUcsS0FBSztRQUN6RyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQixPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDL0M7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDdkQ7UUFDRCxFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFCLElBQUksZUFBZSxFQUFFO1lBQ2pCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3ZELElBQUk7Z0JBQ0EsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDMUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxFQUFFLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBQyxDQUFDLENBQUM7YUFDeEY7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxRQUFRLFVBQVUsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQzNEO1NBQ0o7YUFBTTtZQUNILEVBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQ3JDO1FBRUQsSUFBSSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1YsT0FBTyxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFDLENBQUM7U0FDMUI7UUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNuRCxJQUFJLEdBQUcsRUFBRTtZQUNMLE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQztTQUNoQjtRQUNELE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRVMsV0FBVyxDQUFDLE9BQWU7UUFDakMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDbkQsSUFBSSxXQUFnQixDQUFDO1FBQ3JCLElBQUk7WUFDQSxXQUFXLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM3QztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLE9BQU8sUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNqRixPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztTQUM1QztRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLE9BQU8sY0FBYyxDQUFDLENBQUM7WUFDN0UsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLGdCQUFnQixFQUFDLENBQUM7U0FDNUM7UUFDRCxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFDL0IsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ2pEO1FBRUQsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRTtZQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUM1RCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztTQUM1QztRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDVixPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsZ0JBQWdCLEVBQUMsQ0FBQztTQUM1QztRQUNELElBQUksYUFBYSxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2hCLGFBQWEsR0FBRyxFQUFFLENBQUM7U0FDdEI7UUFDRCxPQUFPO1lBQ0gsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUztZQUN4QixNQUFNLEVBQUU7Z0JBQ0osT0FBTztnQkFDUCxXQUFXO2dCQUNYLGFBQWE7YUFDaEI7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVTLFlBQVksQ0FBQyxXQUFtQixFQUFFLFdBQTZCO1FBQ3JFLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ1gsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFDRCxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJO1lBQ0EsaUVBQWlFO1lBQ2pFLHVDQUF1QztZQUN2QyxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQ3ZELElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUM3QyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUMzQixZQUFZLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztpQkFDN0Y7Z0JBQ0QsV0FBVyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDeEM7WUFFRCxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDdEMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN2QztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDN0MsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFDRCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWU7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1NBQy9DO1FBQ0QsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDVCxPQUFPLEVBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUMsQ0FBQztTQUN6QjtRQUNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDWCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsbUJBQW1CLEVBQUMsQ0FBQztTQUMvQztRQUNELElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsTUFBTyxDQUFDLENBQUM7UUFDMUQsSUFBSSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkMsSUFBSSxHQUFHLEVBQUU7WUFDTCxPQUFPLEVBQUMsR0FBRyxFQUFDLENBQUM7U0FDaEI7UUFDRCxPQUFPLEVBQUMsR0FBRyxFQUFFLHNCQUFTLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsR0FBRyxDQUFDLE1BQU8sQ0FBQyxhQUFhLEVBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU0sS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQWUsRUFBRSxPQUF1RDtRQUNyRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUMzQixPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDL0M7UUFDRCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNULE9BQU8sRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBQyxDQUFDO1NBQ3pCO1FBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNYLE9BQU8sRUFBQyxHQUFHLEVBQUUsc0JBQVMsQ0FBQyxtQkFBbUIsRUFBQyxDQUFDO1NBQy9DO1FBQ0QsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUMxRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7WUFDeEIsSUFBSSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksR0FBRyxFQUFFO2dCQUNMLE9BQU8sRUFBQyxHQUFHLEVBQUMsQ0FBQzthQUNoQjtTQUNKO1FBQ0QsT0FBTyxFQUFDLEdBQUcsRUFBRSxzQkFBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUMsQ0FBQztJQUM3QyxDQUFDO0NBQ0o7QUFuTEQsb0NBbUxDIn0=