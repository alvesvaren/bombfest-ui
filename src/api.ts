import { GameEvent, nonce, RoomData, TokenData } from "./interfaces";
import { EventEmitter } from "events";
import { searchParams } from "./searchparams";
import commands, { Commands } from "./commandParser";

const apiSuffix = `${import.meta.env.VITE_API_HOST}/api`;
const apiEntryPoint = `https://${apiSuffix}`;
const wsEntryPoint = `wss://${apiSuffix}`;

export const gameEmitter = new EventEmitter();
export const authEmitter = new EventEmitter();

export const getToken = () => {
    if (localStorage.token === "undefined") {
        return null;
    }
    return localStorage.token as string;
};

export const friendlyDictNames = {
    sv_SE: "Swedish",
    en_US: "English",
};

export const saveToken = (cuid: string) => {
    localStorage.setItem("token", cuid);
    authEmitter.emit("auth-changed");
};

export const deleteToken = () => {
    localStorage.removeItem("token");
    authEmitter.emit("auth-changed");
};

export const executeCommand = async <T extends keyof Commands>(command: T, ...args: Parameters<Commands[T]["callback"]>): Promise<string> => {
    if (commands[command]) {
        return await commands[command].callback(...(args as any));
    } else {
        return `Unknown command: ${command}`;
    }
};

export const pingServer = async (ws: WebSocket | null) => {
    const timeBefore = Date.now();
    await sendEventWithResponse(ws, "ping", undefined, timeBefore);
    return Date.now() - timeBefore;
};

export const jwtToJson = (token?: string): TokenData | null => {
    try {
        const tokenDataPart = token?.split(".")[1];
        if (!tokenDataPart) return null;
        return JSON.parse(atob(tokenDataPart));
    } catch (e) {
        return null;
    }
};

export const getTokenData = (): TokenData | null => {
    const token = getToken();
    return token ? jwtToJson(token) : null;
};

export const fetchRooms = async (): Promise<RoomData[]> => {
    const response = await fetch(apiEntryPoint + "/rooms");
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json();
};

export const joinRoom = (cuid: string, onMessage?: (e: any) => void, onClose?: (e: CloseEvent) => void) => {
    const ws = new WebSocket(`${wsEntryPoint}/room/${cuid}/ws${searchParams({ authorization: getToken() })}`);
    ws.addEventListener("message", e => (onMessage || (() => {}))(JSON.parse(e.data)));
    ws.addEventListener("close", e => {
        console.info("Websocket connection closed", e);
        (onClose || (() => {}))(e);
    });

    return ws;
};

export const sendEvent = <T extends GameEvent>(ws: WebSocket | null, event: T["type"], data: T["data"], nonce?: nonce) => {
    ws?.send(JSON.stringify({ type: event, data, nonce }));
    return !!ws;
};

export const sendEventWithResponse = <T extends GameEvent>(ws: WebSocket | null, event: T["type"], data: T["data"], nonce: nonce) => {
    return new Promise<GameEvent["data"]>((resolve, reject) => {
        let listener: (e: WebSocketEventMap["message"]) => void;
        listener = (e: WebSocketEventMap["message"]) => {
            const respData = JSON.parse(e.data);
            if (respData.nonce === nonce) {
                ws?.removeEventListener("message", listener);
                resolve(e.data);
            }
            setTimeout(() => {
                ws?.removeEventListener("message", listener);
                reject(new Error("Event timed out"));
            }, 10000);
        };
        ws?.addEventListener("message", listener);
        sendEvent(ws, event, data, nonce);
    });
};

export const createRoom = async (name: string): Promise<RoomData> => {
    const response = await fetch(`${apiEntryPoint}/rooms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ name }),
    });
    if (response.status === 400) {
        throw new Error((await response.json()).error);
    }
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json();
};

export const updateUsername = async (username: string) => {
    console.log(apiEntryPoint)
    const result = await fetch(`${apiEntryPoint}/account`, {
        method: "POST",
        body: JSON.stringify({
            name: username,
            cuid: getTokenData()?.sub,
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken(),
        },
    });

    saveToken((await result.json()).token);
};
