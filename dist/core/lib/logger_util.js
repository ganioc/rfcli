"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const path = require("path");
const fs = require("fs-extra");
const { LogShim } = require('./log_shim');
exports.LogShim = LogShim;
function initLogger(options) {
    if (options.logger) {
        return options.logger;
    }
    else if (options.loggerOptions) {
        const loggerTransports = [];
        if (options.loggerOptions.console) {
            loggerTransports.push(new winston_1.transports.Console({
                level: options.loggerOptions.level ? options.loggerOptions.level : 'info',
                timestamp: true,
                handleExceptions: true,
                humanReadableUnhandledException: true
            }));
        }
        if (options.loggerOptions.file) {
            fs.ensureDirSync(options.loggerOptions.file.root);
            loggerTransports.push(new winston_1.transports.File({
                json: false,
                level: options.loggerOptions.level ? options.loggerOptions.level : 'info',
                timestamp: true,
                filename: path.join(options.loggerOptions.file.root, options.loggerOptions.file.filename || 'info.log'),
                datePattern: 'yyyy-MM-dd.',
                prepend: true,
                handleExceptions: true,
                humanReadableUnhandledException: true
            }));
        }
        const logger = new winston_1.Logger({
            level: options.loggerOptions.level || 'info',
            transports: loggerTransports
        });
        return new LogShim(logger).log;
    }
    else {
        const loggerTransports = [];
        loggerTransports.push(new winston_1.transports.Console({
            level: 'info',
            timestamp: true,
            handleExceptions: true
        }));
        const logger = new winston_1.Logger({
            level: 'info',
            transports: loggerTransports
        });
        return new LogShim(logger).log;
    }
}
exports.initLogger = initLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyX3V0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9saWIvbG9nZ2VyX3V0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxQ0FBMkQ7QUFFM0QsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQixNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBc0RoQywwQkFBTztBQS9DZixvQkFBMkIsT0FBc0I7SUFDN0MsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ2hCLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztLQUN6QjtTQUFNLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRTtRQUM5QixNQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFO1lBQy9CLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFVLENBQUMsT0FBTyxDQUFDO2dCQUN6QyxLQUFLLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNO2dCQUN6RSxTQUFTLEVBQUUsSUFBSTtnQkFDZixnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QiwrQkFBK0IsRUFBRSxJQUFJO2FBQ3hDLENBQUMsQ0FBQyxDQUFDO1NBQ1A7UUFDRCxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFO1lBQzVCLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksb0JBQVUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RDLElBQUksRUFBRSxLQUFLO2dCQUNYLEtBQUssRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU07Z0JBQ3pFLFNBQVMsRUFBRSxJQUFJO2dCQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksVUFBVSxDQUFDO2dCQUN2RyxXQUFXLEVBQUUsYUFBYTtnQkFDMUIsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsZ0JBQWdCLEVBQUUsSUFBSTtnQkFDdEIsK0JBQStCLEVBQUUsSUFBSTthQUN4QyxDQUFDLENBQUMsQ0FBQztTQUNQO1FBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDO1lBQ3RCLEtBQUssRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxNQUFNO1lBQzVDLFVBQVUsRUFBRSxnQkFBZ0I7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7S0FDbEM7U0FBTTtRQUNILE1BQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLG9CQUFVLENBQUMsT0FBTyxDQUFDO1lBQ3pDLEtBQUssRUFBRSxNQUFNO1lBQ2IsU0FBUyxFQUFFLElBQUk7WUFDZixnQkFBZ0IsRUFBRSxJQUFJO1NBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ0osTUFBTSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDO1lBQ3RCLEtBQUssRUFBRSxNQUFNO1lBQ2IsVUFBVSxFQUFFLGdCQUFnQjtTQUMvQixDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztLQUNsQztBQUNMLENBQUM7QUE3Q0QsZ0NBNkNDIn0=