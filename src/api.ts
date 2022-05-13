import { GameEvent, nonce, TokenData } from "./interfaces";
import EventEmitter from "events";

const restEntryPoint = process.env.REACT_APP_REST_ENTRYPOINT;
const wsEntryPoint = process.env.REACT_APP_WS_ENTRYPOINT;

export const gameEmitter = new EventEmitter();

export const getToken = () => {
    if (localStorage.token === "undefined") {
        return null;
    }
    return localStorage.token;
};

export const saveToken = (cuid: string) => {
    localStorage.setItem("token", cuid);
};

export const jwtToJson = (token?: string) => {
    return JSON.parse(atob(token?.split(".")[1] || "{}"));
};

export const getTokenData = (): TokenData | null => {
    const token = getToken();
    return token ? jwtToJson(token) : null;
};

export const fetchRooms = async (): Promise<{ cuid: string; player_count: number; name: string }[]> => {
    const response = await fetch(restEntryPoint + "/rooms");
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json();
};

export const joinRoom = (cuid: string, onMessage?: (e: any) => void, onClose?: (e: CloseEvent) => void) => {
    const searchParams = new URLSearchParams();
    searchParams.set("authorization", getToken() || "");
    const ws = new WebSocket(`${wsEntryPoint}/room/${cuid}/ws?${searchParams.toString()}`);
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

export const createRoom = async (name: string): Promise<string> => {
    const response = await fetch(`${restEntryPoint}/rooms`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json();
};

export const updateUsername = async (username: string) => {
    const result = await fetch(`${restEntryPoint}/account`, {
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
