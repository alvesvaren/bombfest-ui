export interface Command {
    callback: (...args: string[]) => Promise<any>;
    help: string;
}

export type Commands = {
    [key: string]: Command;
};

const commands: Commands = {
    help: {
        callback: async () => {
            let resp = "Available commands:\n";
            for (const key in commands) {
                resp += `  ${key} - ${commands[key].help}\n`;
            }

            return resp;
        },
        help: "Show this help message",
    },
    echo: {
        callback: async (...args: string[]) => {
            return args.join(" ");
        }, 
        help: "Echos the provided arguments"
    }
};

export default commands;
