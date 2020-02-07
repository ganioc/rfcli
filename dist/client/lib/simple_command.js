"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseCommand(argv) {
    if (argv.length < 3) {
        console.log('no enough command');
        return;
    }
    let command = { options: new Map() };
    let start = 2;
    let firstArg = argv[2];
    if (!firstArg.startsWith('--')) {
        command.command = firstArg;
        start = 3;
    }
    let curKey;
    while (start < argv.length) {
        let arg = argv[start];
        if (arg.startsWith('--')) {
            // if (curKey) {
            //     command.options.set(curKey, true);
            // }
            curKey = arg.substr(2);
            command.options.set(curKey, true);
        }
        else {
            if (curKey) {
                command.options.set(curKey, arg);
                curKey = undefined;
            }
            else {
                console.error(`error command ${arg}, key must start with --`);
                return undefined;
            }
        }
        ++start;
    }
    return command;
}
exports.parseCommand = parseCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlX2NvbW1hbmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpZW50L2xpYi9zaW1wbGVfY29tbWFuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLHNCQUE2QixJQUFjO0lBQ3ZDLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQ2pDLE9BQVE7S0FDWDtJQUNELElBQUksT0FBTyxHQUFZLEVBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUMsQ0FBQztJQUM1QyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDNUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7UUFDM0IsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUNiO0lBRUQsSUFBSSxNQUF3QixDQUFDO0lBQzdCLE9BQU8sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDeEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RCLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QixnQkFBZ0I7WUFDaEIseUNBQXlDO1lBQ3pDLElBQUk7WUFDSixNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDckM7YUFBTTtZQUNILElBQUksTUFBTSxFQUFFO2dCQUNSLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMsTUFBTSxHQUFHLFNBQVMsQ0FBQzthQUN0QjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLGlCQUFpQixHQUFHLDBCQUEwQixDQUFDLENBQUM7Z0JBQzlELE9BQU8sU0FBUyxDQUFDO2FBQ3BCO1NBQ0o7UUFDRCxFQUFFLEtBQUssQ0FBQztLQUNYO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQztBQWxDRCxvQ0FrQ0MifQ==