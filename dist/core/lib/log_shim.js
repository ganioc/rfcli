"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Added by Yang Jun for tsc
 */
const assert = require('assert');
const BLOG_STACK_EXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
const BLOG_LINE_EXP = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
class BLogStackHelper {
    static _extractLocation(urlLike) {
        // Fail-fast but return locations like '(native)'
        if (urlLike.indexOf(':') === -1) {
            return [urlLike];
        }
        const parts = BLOG_LINE_EXP.exec(urlLike.replace(/[\(\)]/g, ''));
        if (parts) {
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        }
        else {
            return [undefined];
        }
    }
    static _parseStackString(stackString) {
        const filtered = stackString.split('\n').filter((line) => {
            return !!line.match(BLOG_STACK_EXP);
        });
        return filtered.map((line) => {
            if (line.indexOf('(eval ') > -1) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
            }
            const tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
            // Added by Yang Jun
            let tempToken = tokens.pop();
            let locationParts;
            if (tempToken) {
                locationParts = BLogStackHelper._extractLocation(tempToken);
            }
            // else {
            //     locationParts = [];
            // }
            // const locationParts = BLogStackHelper._extractLocation(tempToken);
            const functionName = tokens.join(' ') || undefined;
            const fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];
            return ({
                functionName: functionName,
                fileName: fileName,
                lineNumber: locationParts[1],
                columnNumber: locationParts[2],
                source: line
            });
        });
    }
    static _getStackString(info) {
        let stack;
        try {
            throw new Error(info);
        }
        catch (e) {
            stack = e.stack;
        }
        return stack;
    }
    static baseName(path) {
        return path.split(/[\\/]/).pop();
    }
    /*
        info = {
            frame : [integer],
            pos : [boolean],
            stack : [boolean],
        }*/
    static getStack(info) {
        const stackString = BLogStackHelper._getStackString('prepare stack');
        const stack = BLogStackHelper._parseStackString(stackString);
        if (info.pos) {
            const frameIndex = info.frame + 3;
            info.pos = null;
            if (stack && stack.length > 0 && frameIndex < stack.length) {
                const frame = stack[frameIndex];
                info.pos = {
                    'line': frame.lineNumber,
                    'file': frame.fileName,
                    'func': frame.functionName,
                };
                if (info.pos.file && !info.fullpath) {
                    info.pos.file = BLogStackHelper.baseName(info.pos.file);
                }
            }
        }
        if (info.stack) {
            if (stack && stack.length > 0) {
                info.stack = '';
                for (let index = info.frame + 3; index < stack.length; ++index) {
                    const frame = stack[index];
                    info.stack += `at ${frame.functionName} (${frame.fileName}:${frame.lineNumber}:${frame.columnNumber})\n`;
                }
            }
            else {
                info.stack = stackString;
            }
        }
    }
}
// log中间层，用以增加下述功能:
// 1. 增加新的日志头和日志尾
// 2. 支持输出行号和堆栈
// 3. 支持trace，fatal等函数，兼容blog
class LogShim {
    constructor(log, options) {
        this.m_preHeaders = [];
        this.m_postHeaders = [];
        this.m_log = log;
        // LogShim支持嵌套，用以标识层级
        this.m_nestLevel = log.__nestlevel == null ? 0 : log.__nestlevel + 1;
        this.m_options = this._defaultOptions();
        for (const key in options) {
            this.m_options[key] = options[key];
        }
        this.m_callOptions = null;
        this.m_extProp = {
            'shim': this,
            'LogShim': LogShim,
            '__nestlevel': this.m_nestLevel,
            'with': (options) => {
                this.m_callOptions = options;
                return this.log;
            },
        };
        this.m_logFuncs = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];
        this.m_handler = {
            get: (target, key, receiver) => {
                if (typeof key === 'string') {
                    if (this.m_extProp.hasOwnProperty(key)) {
                        return this.m_extProp[key];
                    }
                    if (key === 'trace') {
                        key = 'verbose';
                    }
                    else if (key === 'fatal') {
                        key = 'error';
                    }
                    if (this.m_logFuncs.indexOf(key) < 0) {
                        return Reflect.get(target, key, receiver);
                    }
                    return (...args) => {
                        const callOptions = this.m_callOptions;
                        this.m_callOptions = null;
                        const fullArgs = [...this.m_preHeaders, ...args, ...this.m_postHeaders];
                        // 多层Shim嵌套，只有最内层输出pos
                        if (target.__nestlevel == null) {
                            fullArgs.push(this._pos(callOptions ? callOptions.frame : 1));
                        }
                        if (target.__nestlevel != null) {
                            const nestOptions = {};
                            nestOptions.frame = callOptions ? callOptions.frame + 1 : 2;
                            return target.with(nestOptions)[key](...fullArgs);
                        }
                        else {
                            return target[key](...fullArgs);
                        }
                    };
                }
                else {
                    if (key === require('util').inspect.custom) {
                        return () => {
                            return { packageInfo: this.m_packageInfo, moduleName: this.m_moduleName };
                        };
                    }
                    return Reflect.get(target, key, receiver);
                }
            },
            ownKeys: () => {
                return [];
            },
        };
        this.m_proxy = new Proxy(this.m_log, this.m_handler);
    }
    _defaultOptions() {
        return {
            pos: true,
            stack: false,
            fullpath: false,
        };
    }
    _pos(frame) {
        assert(frame >= 1);
        const info = {
            frame: frame,
            pos: this.m_options.pos,
            fullpath: this.m_options.fullpath,
            stack: this.m_options.stack,
        };
        BLogStackHelper.getStack(info);
        const pos = info.pos;
        if (pos.file == null) {
            pos.file = '[unknown]';
        }
        return `${pos.file}:${pos.line}`;
    }
    bind(header, pre) {
        if (pre) {
            this.m_preHeaders.push(header);
        }
        else {
            this.m_postHeaders.push(header);
        }
        return this;
    }
    get log() {
        return this.m_proxy;
    }
}
exports.LogShim = LogShim;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nX3NoaW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9saWIvbG9nX3NoaW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNILE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVqQyxNQUFNLGNBQWMsR0FBRyxpQ0FBaUMsQ0FBQztBQUN6RCxNQUFNLGFBQWEsR0FBRyxnQ0FBZ0MsQ0FBQztBQVF2RDtJQUNJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFlO1FBQ25DLGlEQUFpRDtRQUNqRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3BCO1FBRUQsTUFBTSxLQUFLLEdBQTJCLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLEtBQUssRUFBRTtZQUNQLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUM7U0FDbkU7YUFBTTtZQUNILE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN0QjtJQUVMLENBQUM7SUFFRCxNQUFNLENBQUMsaUJBQWlCLENBQUMsV0FBbUI7UUFDeEMsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNyRCxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxRQUFRLENBQUMsR0FBRyxD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