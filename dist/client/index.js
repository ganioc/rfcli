"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("../core"));
__export(require("./client/client"));
// export * from './lib/simple_command';
// export {init as initUnhandledRejection} from './lib/unhandled_rejection';
// export {rejectifyValue, rejectifyErrorCode} from './lib/rejectify';
// export * from './host/chain_host';
// import {ChainHost} from './host/chain_host';
// let host = new ChainHost();
// export {host};
// import {LoggerInstance, initChainCreator, createValueDebuger, ErrorCode, ValueIndependDebugSession, ValueChainDebugSession} from '../core';
// const valueChainDebuger = {
//     async createIndependSession(loggerOptions: {logger?: LoggerInstance, loggerOptions?: {console: boolean, file?: {root: string, filename?: string}}, level?: string}, dataDir: string): Promise<{err: ErrorCode, session?: ValueIndependDebugSession}> {        
//         const cdr = await createValueDebuger(initChainCreator(loggerOptions), dataDir);
//         if (cdr.err) {
//             return {err: cdr.err};
//         }
//         return {err: ErrorCode.RESULT_OK, session: cdr.debuger!.createIndependSession()};
//     },
//     async createChainSession(loggerOptions: {logger?: LoggerInstance, loggerOptions: {console: boolean, file?: {root: string, filename?: string}}, level?: string}, dataDir: string, debugerDir: string): Promise<{err: ErrorCode, session?: ValueChainDebugSession}> {
//         const cdr = await createValueDebuger(initChainCreator(loggerOptions), dataDir);
//         if (cdr.err) {
//             return {err: cdr.err};
//         }
//         return cdr.debuger!.createChainSession(debugerDir);
//     }
// };
// export {valueChainDebuger};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpZW50L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQXdCO0FBQ3hCLHFDQUFnQztBQUNoQyx3Q0FBd0M7QUFDeEMsNEVBQTRFO0FBQzVFLHNFQUFzRTtBQUV0RSxxQ0FBcUM7QUFDckMsK0NBQStDO0FBQy9DLDhCQUE4QjtBQUU5QixpQkFBaUI7QUFFakIsOElBQThJO0FBQzlJLDhCQUE4QjtBQUM5QixxUUFBcVE7QUFDclEsMEZBQTBGO0FBQzFGLHlCQUF5QjtBQUN6QixxQ0FBcUM7QUFDckMsWUFBWTtBQUNaLDRGQUE0RjtBQUM1RixTQUFTO0FBRVQsMFFBQTBRO0FBQzFRLDBGQUEwRjtBQUMxRix5QkFBeUI7QUFDekIscUNBQXFDO0FBQ3JDLFlBQVk7QUFDWiw4REFBOEQ7QUFDOUQsUUFBUTtBQUNSLEtBQUs7QUFDTCw4QkFBOEIifQ==