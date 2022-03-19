const restEntryPoint = process.env.REACT_APP_REST_ENTRYPOINT;
const wsEntryPoint = process.env.REACT_APP_WS_ENTRYPOINT;

export const getToken = () => {
    return localStorage.getItem("token");
};

export const saveToken = (uuid: string) => {
    localStorage.setItem("token", uuid);
};

export const jwtToJson = (token: string) => {
    return JSON.parse(atob(token.split(".")[1]));
};

export const getTokenData = () => {
    const token = getToken();
    if (token) {
        return jwtToJson(token);
    }
    return null;
};

export const fetchRooms = async (): Promise<{ uuid: string; player_count: number; name: string }[]> => {
    const response = await fetch(restEntryPoint + "/rooms");
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json();
};

export const joinRoom = (uuid: string, onMessage?: (e: any) => void, onClose?: (e: CloseEvent) => void) => {
    const searchParams = new URLSearchParams();
    searchParams.set("authorization", getToken() || "");
    const ws = new WebSocket(`${wsEntryPoint}/room/${uuid}/ws?${searchParams.toString()}`);
    ws.addEventListener("message", e => (onMessage || (() => undefined))(JSON.parse(e.data)));
    ws.addEventListener("close", e => {
        (onClose || (() => undefined))(e);
        console.warn("Websocket connection closed", e);
    });

    return () => ws.close();
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
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getToken(),
        },
    });

    saveToken((await result.json()).token);
};
