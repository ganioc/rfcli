"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_code_1 = require("../error_code");
const Address = require("../address");
const encoding_1 = require("../lib/encoding");
const writer_1 = require("../lib/writer");
const digest = require("../lib/digest");
function instance(superClass) {
    return class extends superClass {
        constructor(...args) {
            super(args[0]);
            // Uint8Array(33)
            this.m_pubkey = encoding_1.Encoding.ZERO_KEY;
            // Uint8Array(64)
            this.m_sign = encoding_1.Encoding.ZERO_SIG64;
        }
        get pubkey() {
            return this.m_pubkey;
        }
        set pubkey(k) {
            this.m_pubkey = k;
        }
        get miner() {
            return Address.addressFromPublicKey(this.m_pubkey);
        }
        encode(writer) {
            try {
                writer.writeBytes(this.m_sign);
            }
            catch (e) {
                return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
            }
            return super.encode(writer);
        }
        decode(reader) {
            this.m_sign = reader.readBytes(64);
            return super.decode(reader);
        }
        _encodeHashContent(writer) {
            let err = super._encodeHashContent(writer);
            if (err) {
                return err;
            }
            try {
                writer.writeBytes(this.m_pubkey);
            }
            catch (e) {
                return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
            }
            return error_code_1.ErrorCode.RESULT_OK;
        }
        _decodeHashContent(reader) {
            let err = super._decodeHashContent(reader);
            if (err !== error_code_1.ErrorCode.RESULT_OK) {
                return err;
            }
            this.m_pubkey = reader.readBytes(33);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        signBlock(secret) {
            this.m_pubkey = Address.publicKeyFromSecretKey(secret);
            let writer = new writer_1.BufferWriter();
            let err = this._encodeSignContent(writer);
            if (err) {
                return err;
            }
            let content;
            try {
                content = writer.render();
            }
            catch (e) {
                return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
            }
            let signHash = digest.hash256(content);
            this.m_sign = Address.signBufferMsg(signHash, secret);
            return error_code_1.ErrorCode.RESULT_OK;
        }
        _encodeSignContent(writer) {
            let err = super._encodeHashContent(writer);
            if (err) {
                return err;
            }
            try {
                writer.writeBytes(this.m_pubkey);
            }
            catch (e) {
                return error_code_1.ErrorCode.RESULT_INVALID_FORMAT;
            }
            return error_code_1.ErrorCode.RESULT_OK;
        }
        _verifySign() {
            let writer = new writer_1.BufferWriter();
            this._encodeSignContent(writer);
            let signHash = digest.hash256(writer.render());
            return Address.verifyBufferMsg(signHash, this.m_sign, this.m_pubkey);
        }
        stringify() {
            let obj = super.stringify();
            obj.creator = Address.addressFromPublicKey(this.m_pubkey);
            return obj;
        }
    };
}
exports.instance = instance;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmxvY2tfd2l0aF9zaWduLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvcmUvYmxvY2svYmxvY2tfd2l0aF9zaWduLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsOENBQTBDO0FBQzFDLHNDQUFzQztBQUV0Qyw4Q0FBMkM7QUFDM0MsMENBQTZDO0FBRTdDLHdDQUF3QztBQUl4QyxrQkFBeUIsVUFBOEM7SUFDbkUsT0FBTyxLQUFNLFNBQVEsVUFBVTtRQUMzQixZQUFZLEdBQUcsSUFBVztZQUN0QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFHbkIsaUJBQWlCO1lBQ1QsYUFBUSxHQUFXLG1CQUFRLENBQUMsUUFBUSxDQUFDO1lBQzdDLGlCQUFpQjtZQUNULFdBQU0sR0FBVyxtQkFBUSxDQUFDLFVBQVUsQ0FBQztRQUw3QyxDQUFDO1FBT0QsSUFBSSxNQUFNO1lBQ04sT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7UUFFRCxJQUFJLE1BQU0sQ0FBQyxDQUFTO1lBQ2hCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxJQUFJLEtBQUs7WUFDTCxPQUFPLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFFLENBQUM7UUFDeEQsQ0FBQztRQUVNLE1BQU0sQ0FBQyxNQUFvQjtZQUM5QixJQUFJO2dCQUNBLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ2xDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsT0FBTyxzQkFBUyxDQUFDLHFCQUFxQixDQUFDO2FBQzFDO1lBQ0QsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLENBQUM7UUFFTSxNQUFNLENBQUMsTUFBb0I7WUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBRVMsa0JBQWtCLENBQUMsTUFBb0I7WUFDN0MsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksR0FBRyxFQUFFO2dCQUNMLE9BQU8sR0FBRyxDQUFDO2FBQ2Q7WUFDRCxJQUFJO2dCQUNBLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3BDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsT0FBTyxzQkFBUyxDQUFDLHFCQUFxQixDQUFDO2FBQzFDO1lBRUQsT0FBTyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBRVMsa0JBQWtCLENBQUMsTUFBb0I7WUFDN0MsSUFBSSxHQUFHLEdBQWMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RELElBQUksR0FBRyxLQUFLLHNCQUFTLENBQUMsU0FBUyxFQUFFO2dCQUM3QixPQUFPLEdBQUcsQ0FBQzthQUNkO1lBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sc0JBQVMsQ0FBQyxTQUFTLENBQUM7UUFDL0IsQ0FBQztRQUVNLFNBQVMsQ0FBQyxNQUFjO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBVyxDQUFDO1lBQ2pFLElBQUksTUFBTSxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO1lBQ2hDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxJQUFJLEdBQUcsRUFBRTtnQkFDTCxPQUFPLEdBQUcsQ0FBQzthQUNkO1lBQ0QsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJO2dCQUNBLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDN0I7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixPQUFPLHNCQUFTLENBQUMscUJBQXFCLENBQUM7YUFDMUM7WUFDRCxJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEQsT0FBTyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBRVMsa0JBQWtCLENBQUMsTUFBb0I7WUFDN0MsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNDLElBQUksR0FBRyxFQUFFO2dCQUNMLE9BQU8sR0FBRyxDQUFDO2FBQ2Q7WUFDRCxJQUFJO2dCQUNBLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3BDO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsT0FBTyxzQkFBUyxDQUFDLHFCQUFxQixDQUFDO2FBQzFDO1lBRUQsT0FBTyxzQkFBUyxDQUFDLFNBQVMsQ0FBQztRQUMvQixDQUFDO1FBRVMsV0FBVztZQUNqQixJQUFJLE1BQU0sR0FBRyxJQUFJLHFCQUFZLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUMvQyxPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFTSxTQUFTO1lBQ1osSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQzVCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMxRCxPQUFPLEdBQUcsQ0FBQztRQUNmLENBQUM7S0FDSixDQUFDO0FBQ04sQ0FBQztBQXpHRCw0QkF5R0MifQ==