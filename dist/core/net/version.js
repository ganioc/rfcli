"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
let MAIN_VERSION = '1.2.3.4';
class Version {
    constructor() {
        this.m_genesis = '';
        this.m_mainVersion = MAIN_VERSION;
        this.m_timestamp = Date.now();
        this.m_peerid = '';
        this.m_random = 1000000 * Math.random();
    }
    compare(other) {
        if (this.m_timestamp > other.m_timestamp) {
            return 1;
        }
        else if (this.m_timestamp < other.m_timestamp) {
            return -1;
        }
        if (this.m_random > other.m_random) {
            return 1;
        }
        else if (this.m_random > other.m_random) {
            return -1;
        }
        return 0;
    }
    set mainversion(v) {
        this.m_mainVersion = v;
    }
    get mainversion() {
        return this.m_mainVersion;
    }
    get timestamp() {
        return this.m_timestamp;
    }
    set genesis(genesis) {
        this.m_genesis = genesis;
    }
    get genesis() {
        return this.m_genesis;
    }
    set peerid(p) {
        this.m_peerid = p;
    }
    get peerid() {
        return this.m_peerid;
    }
    decode(reader) {
        try {
            this.m_timestamp = reader.readU64();
            this.m_peerid = reader.readVarString();
            this.m_genesis = reader.readVarString();
            this.m_mainVersion = reader.readVarString();
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    encode(writer) {
        try {
            writer.writeU64(this.m_timestamp);
            writer.writeVarString(this.m_peerid);
            writer.writeVarString(this.m_genesis);
            writer.writeVarString(this.m_mainVersion);
        }
        catch (e) {
            return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
        }
        return error_code_1.ErrorCode.RESULT_OK;
    }
    isSupport() {
        return true;
    }
}
exports.Version = Version;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldC92ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsOENBQXdDO0FBS3hDLElBQUksWUFBWSxHQUFXLFNBQVMsQ0FBQztBQUVyQztJQU9JO1FBSFUsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUk3QixJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztRQUNsQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVELE9BQU8sQ0FBQyxLQUFjO1FBQ2xCLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDO1NBQ1o7YUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUM3QyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2I7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtZQUNoQyxPQUFPLENBQUMsQ0FBQztTQUNaO2FBQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUU7WUFDdkMsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNiO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBRUQsSUFBSSxXQUFXLENBQUMsQ0FBUztRQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDVCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDNUIsQ0FBQztJQUVELElBQUksT0FBTyxDQUFDLE9BQWU7UUFDdkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQUksT0FBTztRQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxNQUFNLENBQUMsQ0FBUztRQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxNQUFNLENBQUMsTUFBb0I7UUFDOUIsSUFBSTtZQUNBLElBQUksQ0FBQyxXQUFXLEdBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQy9DO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLHNCQUFTLENBQUMscUJBQXFCLENBQUM7U0FDMUM7UUFDRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFTSxNQUFNLENBQUMsTUFBb0I7UUFDOUIsSUFBSTtZQUNBLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1NBQzdDO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLHNCQUFTLENBQUMscUJBQXFCLENBQUM7U0FDMUM7UUFFRCxPQUFPLHNCQUFTLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBcEZELDBCQW9GQyJ9