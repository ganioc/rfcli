"use strict";
let prompt1 = require('prompts-ex');
async function main() {
    while (1) {
        const onCancel = (promptArg) => {
            console.log('exit rfccli');
            process.exit(1);
        };
        const response = await prompt1([{
                type: 'textex',
                name: 'cmd',
                message: '>'
            }], { onCancel });
        // on arrow key
        if (response.cmd) {
            process.stdout.write("response:" + response.cmd + "\n");
        }
    }
}
main();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdHByb21wdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90ZXN0L3Rlc3Rwcm9tcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUVwQyxLQUFLO0lBRUgsT0FBTyxDQUFDLEVBQUU7UUFDUixNQUFNLFFBQVEsR0FBRyxDQUFDLFNBQWMsRUFBRSxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDM0IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUE7UUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLE9BQU8sQ0FBQyxDQUFDO2dCQUM5QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxJQUFJLEVBQUUsS0FBSztnQkFDWCxPQUFPLEVBQUUsR0FBRzthQUNiLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFFbEIsZUFBZTtRQUdmLElBQUksUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNoQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUN6RDtLQUNGO0FBQ0gsQ0FBQztBQUVELElBQUksRUFBRSxDQUFDIn0=