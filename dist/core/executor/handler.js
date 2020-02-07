"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const util_1 = require("util");
class BaseHandler {
    constructor() {
        this.m_txListeners = new Map();
        this.m_viewListeners = new Map();
        this.m_preBlockListeners = [];
        this.m_postBlockListeners = [];
        this.m_eventDefinations = new Map();
    }
    addTX(name, listener, checker) {
        if (name.length > 0 && listener) {
            this.m_txListeners.set(name, { listener, checker });
        }
    }
    getTxListener(name) {
        const stub = this.m_txListeners.get(name);
        if (!stub) {
            return undefined;
        }
        return stub.listener;
    }
    getTxPendingChecker(name) {
        const stub = this.m_txListeners.get(name);
        if (!stub) {
            return undefined;
        }
        if (!stub.checker) {
            return (tx) => error_code_1.ErrorCode.RESULT_OK;
        }
        return stub.checker;
    }
    addViewMethod(name, listener) {
        if (name.length > 0 && listener) {
            this.m_viewListeners.set(name, listener);
        }
    }
    getViewMethod(name) {
        return this.m_viewListeners.get(name);
    }
    getViewMethodNames() {
        return [...this.m_viewListeners.keys()];
    }
    addPreBlockListener(filter, listener) {
        this.m_preBlockListeners.push({ filter, listener });
    }
    addPostBlockListener(filter, listener) {
        this.m_postBlockListeners.push({ filter, listener });
    }
    getPreBlockListeners(h) {
        let listeners = [];
        for (let index = 0; index < this.m_preBlockListeners.length; ++index) {
            let s = this.m_preBlockListeners[index];
            if (util_1.isNullOrUndefined(h) || s.filter(h)) {
                listeners.push({ listener: s.listener, index });
            }
        }
        return listeners;
    }
    getPostBlockListeners(h) {
        let listeners = [];
        for (let index = 0; index < this.m_postBlockListeners.length; ++index) {
            let s = this.m_postBlockListeners[index];
            if (util_1.isNullOrUndefined(h) || s.filter(h)) {
                listeners.push({ listener: s.listener, index });
            }
        }
        return listeners;
    }
    defineEvent(name, def) {
        this.m_eventDefinations.set(name, def);
    }
    getEventDefination(name) {
        return this.m_eventDefinations.get(name);
    }
    getEventDefinations() {
        const d = this.m_eventDefinations;
        return d;
    }
}
exports.BaseHandler = BaseHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2V4ZWN1dG9yL2hhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw4Q0FBd0M7QUFFeEMsK0JBQXlDO0FBV3pDO0lBTUk7UUFMVSxrQkFBYSxHQUFvRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQzNGLG9CQUFlLEdBQThCLElBQUksR0FBRyxFQUFFLENBQUM7UUFDdkQsd0JBQW1CLEdBQWlFLEVBQUUsQ0FBQztRQUN2Rix5QkFBb0IsR0FBaUUsRUFBRSxDQUFDO1FBeUZ4Rix1QkFBa0IsR0FBMEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQXRGaEUsQ0FBQztJQUlNLEtBQUssQ0FBQyxJQUFZLEVBQUUsUUFBb0IsRUFBRSxPQUEwQjtRQUN2RSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFFBQVEsRUFBRTtZQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztTQUNyRDtJQUNMLENBQUM7SUFFTSxhQUFhLENBQUMsSUFBWTtRQUM3QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1AsT0FBTyxTQUFTLENBQUM7U0FDcEI7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDekIsQ0FBQztJQUVNLG1CQUFtQixDQUFDLElBQVk7UUFDbkMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZixPQUFP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