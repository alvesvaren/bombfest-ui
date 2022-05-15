export interface Command<T extends string[]> {
    callback: (...args: T) => Promise<any>;
    help: string;
}

export type Commands = {
    [key: string]: Command<string[]>;
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
};

export default commands;
