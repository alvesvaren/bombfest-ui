import React from "react";
import { useParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { joinRoom } from "../api";
import { BaseGameState, defaultRules, GameBroadcastEvent } from "../interfaces";
import Chat from "./Chat";
import Game from "./Game";

export interface ChatMessage {
    from: string;
    text: string;
}

export interface RoomState extends BaseGameState {
    chat: ChatMessage[];
    startAt: number | null;
}

const defaultRoomState: RoomState = {
    chat: [],
    players: [],
    prompt: null,
    currentPlayerIndex: 0,
    language: "sv_SE",
    playingPlayers: [],
    rules: defaultRules,
    startAt: null,
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

const roomStateReducer = (state: RoomState, action: GameBroadcastEvent): RoomState => {
    let event: Event | null = null;
    switch (action.type) {
        case "state":
            return { ...state, ...action.data };
        case "chat":
            return { ...state, chat: [...state.chat, action.data] };
        case "join":
            return { ...state, players: [...state.players, action.data] };
        case "leave":
            return { ...state, players: state.players.filter(p => p.uuid !== action.data.uuid) };
        case "start":
            return { ...state, startAt: action.data.at };
        case "text":
            return { ...state, players: state.players.map(p => (p.uuid === action.data.from ? { ...p, text: action.data.text } : p)) };
        case "incorrect":
            event = new Event("incorrect");
            document.dispatchEvent(event);
            break;
        case "correct":
            event = new Event("correct");
            document.dispatchEvent(event);
            break;
        case "damage":
            event = new Event("damage");
            document.dispatchEvent(event);
            break;
    }

    return state;
};

const Room = () => {
    const params = useParams();
    const roomId = params.id || "";
    const [errorMsg, setErrorMsg] = React.useState("");
    const [roomSocket, setRoomSocket] = React.useState<WebSocket | null>(null);
    const [currentRoomState, handleNewCurrentRoomState] = React.useReducer(roomStateReducer, defaultRoomState);

    (window as any).currentRoomState = currentRoomState;

    useEffectOnce(() => {
        setErrorMsg("");
        const ws = joinRoom(
            roomId || "",
            (message: GameBroadcastEvent) => {
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
                <div className='room'>
                    <p className='error'>{errorMsg}</p>
                    <Game />
                    <Chat />
                </div>
            </RoomStateContext.Provider>
        </RoomSocketConnectionContext.Provider>
    );
};

export default Room;
