import React from "react";
import { useParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { joinRoom } from "../api";
import { GameBroadcastEvent, GameEvent, PlayerData } from "../interfaces";
import Chat from "./Chat";

export interface ChatMessage {
    from: string;
    text: string;
}

export interface RoomState {
    chat: ChatMessage[];
    players: PlayerData[];
    prompt?: string;
    currentPlayer?: string;
}

const defaultRoomState: RoomState = {
    chat: [],
    players: [],
    prompt: undefined,
    currentPlayer: undefined,
};

const RoomStateContext = React.createContext<RoomState | null>(null);
const RoomSocketConnectionContext = React.createContext<WebSocket | null>(null);

export const useRoomState = () => {
    const context = React.useContext(RoomStateContext);
    if (!context) {
        throw new Error("useRoomState must be used within a RoomStateProvider");
    }
    return context;
};

export const useRoomSocket = () => {
    return React.useContext(RoomSocketConnectionContext);
};

const roomStateReducer = (state: RoomState, action: GameEvent | GameBroadcastEvent): RoomState => {
    switch (action.type) {
        case "state":
            return { ...state, ...action.data };
        case "chat":
            return { ...state, chat: [...state.chat, { from: "Unknown", ...action.data }] };
        case "join":
            return { ...state, players: [...state.players, action.data] };
        case "leave":
            return { ...state, players: state.players.filter(p => p.uuid !== action.data.uuid) };
    }

    return state;
};

const Room = () => {
    const params = useParams();
    const roomId = params.id || "";
    const [errorMsg, setErrorMsg] = React.useState("");
    const [roomSocket, setRoomSocket] = React.useState<WebSocket | null>(null);
    const [currentRoomState, handleNewCurrentRoomState] = React.useReducer(roomStateReducer, defaultRoomState);
    console.log(currentRoomState);

    (window as any).currentRoomState = currentRoomState;

    useEffectOnce(() => {
        setErrorMsg("");
        const ws = joinRoom(
            roomId || "",
            (message: GameEvent | GameBroadcastEvent) => {
                console.log(message);
                handleNewCurrentRoomState(message);
            },
            closeEvent => {
                if (closeEvent.reason || !closeEvent.wasClean) {
                    setErrorMsg(closeEvent.reason || "Connection closed unexpectedly");
                }
            }
        );

        setRoomSocket(ws);

        return () => ws.close();
    });

    return (
        <RoomSocketConnectionContext.Provider value={roomSocket}>
            <RoomStateContext.Provider value={currentRoomState}>
                <p className='error'>{errorMsg}</p>
                {/* <Game>

            </Game> */}
                <Chat />
            </RoomStateContext.Provider>
        </RoomSocketConnectionContext.Provider>
    );
};

export default Room;
