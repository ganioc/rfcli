"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BlockExecutorRoutineState;
(function (BlockExecutorRoutineState) {
    BlockExecutorRoutineState[BlockExecutorRoutineState["init"] = 0] = "init";
    BlockExecutorRoutineState[BlockExecutorRoutineState["running"] = 1] = "running";
    BlockExecutorRoutineState[BlockExecutorRoutineState["finished"] = 2] = "finished";
})(BlockExecutorRoutineState = exports.BlockExecutorRoutineState || (exports.BlockExecutorRoutineState = {}));
class BlockExecutorRoutine {
    constructor(options) {
        this.m_logger = options.logger;
        this.m_block = options.block;
        this.m_storage = options.storage;
        this.m_name = options.name;
    }
    get name() {
        return this.m_name;
    }
    get block() {
        return this.m_block;
    }
    get storage() {
        return this.m_storage;
    }
}
exports.BlockExecutorRoutine = BlockExecutorRoutine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlY3V0b3Jfcm91dGluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL2NoYWluL2V4ZWN1dG9yX3JvdXRpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFVQSxJQUFZLHlCQUlYO0FBSkQsV0FBWSx5QkFBeUI7SUFDakMseUVBQUksQ0FBQTtJQUNKLCtFQUFPLENBQUE7SUFDUCxpRkFBUSxDQUFBO0FBQ1osQ0FBQyxFQUpXLHlCQUF5QixHQUF6QixpQ0FBeUIsS0FBekIsaUNBQXlCLFFBSXBDO0FBRUQ7SUFDSSxZQUFZLE9BS1g7UUFDRyxJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxLQUFLO1FBQ0wsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLE9BQU87UUFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztDQVdKO0FBbENELG9EQWtDQyJ9