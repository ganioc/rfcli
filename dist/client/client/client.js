"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const rpc_1 = require("./rpc");
class ChainClient extends rpc_1.HostClient {
    constructor(options) {
        super(options);
        this.m_emitter = new events_1.EventEmitter();
    }
    on(event, listener) {
        this.m_emitter.on(event, listener);
        this._beginWatchTipBlock();
        return this;
    }
    once(event, listener) {
        this.m_emitter.once(event, listener);
        this._beginWatchTipBlock();
        return this;
    }
    async _beginWatchTipBlock() {
        if (this.m_tipBlockTimer) {
            return;
        }
        this.m_tipBlockTimer = setInterval(async () => {
            let { err, block } = await this.getBlock({ which: 'latest' });
            if (block) {
                if (!this.m_tipBlock || this.m_tipBlock.hash !== block.hash) {
                    this.m_tipBlock = block;
                    this.m_emitter.emit('tipBlock', this.m_tipBlock);
                    if (!this.m_emitter.listenerCount('tipBlock')) {
                        clearInterval(this.m_tipBlockTimer);
                        delete this.m_tipBlockTimer;
                    }
                }
            }
            // TODO: set block interval 
        }, 10000);
    }
}
exports.ChainClient = ChainClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NsaWVudC9jbGllbnQvY2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQW9DO0FBQ3BDLCtCQUFvRDtBQUlwRCxpQkFBeUIsU0FBUSxnQkFBVTtJQUN2QyxZQUFZLE9BQTJCO1FBQ25DLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQXdDWCxjQUFTLEdBQUcsSUFBSSxxQkFBWSxFQUFFLENBQUM7SUF2Q3ZDLENBQUM7SUFHRCxFQUFFLENBQUMsS0FBc0IsRUFBRSxRQUFrQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELElBQUksQ0FBQyxLQUFzQixFQUFFLFFBQWtDO1FBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU8sS0FBSyxDQUFDLG1CQUFtQjtRQUM3QixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDdEIsT0FBUTtTQUNYO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxXQUFXLENBQzlCLEtBQUssSUFBSSxFQUFFO1lBQ1AsSUFBSSxFQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLEtBQUssRUFBRTtnQkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxFQUFFO29CQUN6RCxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDakQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFO3dCQUMzQyxhQUFhLENBQUMsSUFBSSxDQUFDLGVBQWdCLENBQUMsQ0FBQzt3QkFDckMsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO3FCQUMvQjtpQkFDSjthQUNKO1lBQ0QsNEJBQTRCO1FBQ2hDLENBQUMsRUFBRSxLQUFLLENBQ1gsQ0FBQztJQUNOLENBQUM7Q0FLSjtBQTNDRCxrQ0EyQ0MifQ==