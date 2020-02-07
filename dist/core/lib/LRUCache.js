"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LRUNode {
    constructor(value) {
        this.m_next = null;
        this.m_prev = null;
        this.m_v = value;
    }
    set next(node) {
        this.m_next = node;
    }
    get next() {
        return this.m_next;
    }
    set prev(node) {
        this.m_prev = node;
    }
    get prev() {
        return this.m_prev;
    }
    get value() {
        return this.m_v;
    }
}
class DLink {
    constructor() {
        this.m_head = null;
        this.m_tail = null;
        this.m_count = 0;
    }
    get length() {
        return this.m_count;
    }
    get head() {
        return this.m_head;
    }
    get tail() {
        return this.m_tail;
    }
    remove(node) {
        if (this.length === 0) {
            return;
        }
        let prev = node.prev;
        let next = node.next;
        if (prev) {
            prev.next = next;
        }
        if (this.m_head === node) {
            this.m_head = next;
        }
        if (next) {
            next.prev = prev;
        }
        if (this.m_tail === node) {
            this.m_tail = prev;
        }
        this.m_count--;
    }
    addToHead(node) {
        let head = this.m_head;
        node.next = this.m_head;
        if (this.m_head) {
            this.m_head.prev = node;
        }
        this.m_head = node;
        if (this.m_count === 0) {
            this.m_tail = node;
        }
        this.m_count++;
    }
    removeTail() {
        if (this.length === 0) {
            return;
        }
        this.remove(this.m_tail);
    }
    clear() {
        this.m_head = null;
        this.m_tail = null;
        this.m_count = 0;
    }
}
class LRUCache {
    constructor(maxCount) {
        this.m_maxCount = maxCount;
        this.m_memValue = new Map();
        this.m_link = new DLink();
    }
    set(key, value) {
        if (this.m_memValue.has(key)) {
            let [_, node] = this.m_memValue.get(key);
            this.m_link.remove(node);
            this.m_link.addToHead(node);
            this.m_memValue.set(key, [value, node]);
        }
        else {
            if (this.m_link.length >= this.m_maxCount) {
                this.m_link.removeTail();
            }
            let node = new LRUNode(key);
            this.m_link.addToHead(node);
            this.m_memValue.set(key, [value, node]);
        }
    }
    get(key) {
        if (!this.m_memValue.has(key)) {
            return null;
        }
        let [value, _] = this.m_memValue.get(key);
        this.set(key, value);
        return value;
    }
    remove(key) {
        if (!this.m_memValue.has(key)) {
            return;
        }
        let [_, node] = this.m_memValue.get(key);
        this.m_link.remove(node);
        this.m_memValue.delete(key);
    }
    clear() {
        this.m_memValue.clear();
        this.m_link.clear();
    }
    print() {
        let begin = this.m_link.head;
        while (begin) {
            let key = begin.value;
            let [value, _] = this.m_memValue.get(key);
            begin = begin.next;
        }
    }
}
exports.LRUCache = LRUCache;
// let lru: LRUCache<number,string> = new LRUCache<number,string>(5);
// lru.set(1,'a');
// lru.print();
// lru.remove(1);
// lru.print();
// lru.set(1,'a');
// lru.set(2,'b');
// lru.set(3,'c');
// lru.set(4,'d');
// lru.set(5,'e');
// lru.print();
// let s:string|null = lru.get(3);
// lru.print();
// lru.set(6,'f');
// lru.print();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTFJVQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29yZS9saWIvTFJVQ2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTtJQUlJLFlBQVksS0FBUTtRQUhWLFdBQU0sR0FBb0IsSUFBSSxDQUFDO1FBQy9CLFdBQU0sR0FBb0IsSUFBSSxDQUFDO1FBR3JDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxJQUFxQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLElBQUksQ0FBQyxJQUFxQjtRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLEtBQUs7UUFDTCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDcEIsQ0FBQztDQUNKO0FBRUQ7SUFLSTtRQUhVLFdBQU0sR0FBb0IsSUFBSSxDQUFDO1FBQy9CLFdBQU0sR0FBb0IsSUFBSSxDQUFDO1FBR3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxJQUFJLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksSUFBSTtRQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBZ0I7UUFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFB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