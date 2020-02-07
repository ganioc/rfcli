"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Package {
    constructor() {
        this.m_header = {
            magic: Package.magic,
            version: 0,
            flags: 0,
            cmdType: 0,
            totalLength: 0,
            bodyLength: 0,
        };
        this.m_body = {};
        this.m_data = [];
    }
    get header() {
        return this.m_header;
    }
    get body() {
        return this.m_body;
    }
    get data() {
        return this.m_data;
    }
    copyData() {
        let buffer = new Buffer(this.dataLength);
        let copyStart = 0;
        for (let data of this.data) {
            data.copy(buffer, copyStart);
            copyStart += data.length;
        }
        return buffer;
    }
    get dataLength() {
        const header = this.m_header;
        return header.totalLength - Package.headerLength - header.bodyLength;
    }
}
Package.headerLength = 16;
Package.magic = 0x8083;
exports.Package = Package;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFja2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL25ldC9wYWNrYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBVUE7SUFRSTtRQUNJLElBQUksQ0FBQyxRQUFRLEdBQUc7WUFDWixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUs7WUFDcEIsT0FBTyxFQUFFLENBQUM7WUFDVixLQUFLLEVBQUUsQ0FBQztZQUNSLE9BQU8sRUFBRSxDQUFDO1lBQ1YsV0FBVyxFQUFFLENBQUM7WUFDZCxVQUFVLEVBQUUsQ0FBQztTQUNoQixDQUFDO1FBQ0YsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVELElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN6QixDQUFDO0lBRUQsSUFBSSxJQUFJO1FBQ0osT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLElBQUk7UUFDSixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELFFBQVE7UUFDSixJQUFJLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekMsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLEtBQUssSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3QixTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUM1QjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDVixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzdCLE9BQU8sTUFBTSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUM7SUFDekUsQ0FBQzs7QUF6Q2Esb0JBQVksR0FBVyxFQUFFLENBQUM7QUFDMUIsYUFBSyxHQUFXLE1BQU0sQ0FBQztBQU56QywwQkErQ0MifQ==