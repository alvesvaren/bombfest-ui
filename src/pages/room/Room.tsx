import React from "react";
import { useParams } from "react-router-dom";
import { useEffectOnce } from "react-use";
import { gameEmitter, joinRoom } from "../../api";
import { useFlash } from "../../hooks";
import { BaseGameState, ChatMessage, defaultRules, GameBroadcastEvent } from "../../interfaces";
import Chat from "./Chat";
import Game from "./Game";
import styles from "./Room.module.scss";

export interface RoomState extends BaseGameState {
    chat: ChatMessage[];
    startAt: number | null;
}

const defaultRoomState: RoomState = {
    chat: [],
    players: [],
    prompt: null,
    currentPlayer: null,
    language: "sv_SE",
    playingPlayers: [],
    rules: defaultRules,
    startAt: null,
    bombExplodesIn: null,
    isPlaying: false
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

export const useRoomEvent = (event: "incorrect" | "correct" | "damage" | "end" | "error", handler: (data: any) => void) => {
    React.useEffect(() => {
        gameEmitter.addListener(event, handler);
        return () => void gameEmitter.removeListener(event, handler);
    }, [event, handler]);
}

const roomStateReducer = (state: RoomState, action: GameBroadcastEvent): RoomState => {
    switch (action.type) {
        case "state":
            return { ...state, ...action.data };
        case "chat":
            return { ...state, chat: [...state.chat, action.data] };
        case "join":
            return { ...state, players: [...state.players, action.data] };
        case "leave":
            return { ...state, players: state.players.filter(p => p.cuid !== action.data.cuid) };
        case "start":
            console.log("AWDAWDWDAWDAWD", state)
            return { ...state, startAt: (new Date()).getTime() + action.data.in };
        case "text":
            return { ...state, players: state.players.map(p => (p.cuid === action.data.from ? { ...p, text: action.data.text } : p)) };
        case "incorrect":
            gameEmitter.emit("incorrect", action.data);
            break;
        case "correct":
            gameEmitter.emit("correct", action.data);
            break;
        case "damage":
            gameEmitter.emit("damage", action.data);
            break;
        case "end":
            gameEmitter.emit("end", action.data);
            break;
        case "error":
            gameEmitter.emit("error", action.data);
            break;
    }
    console.log(state, action);
    return state;
};

const Room = () => {
    const params = useParams();
    const roomId = params.id || "";
    const [errorMsg, setErrorMsg] = React.useState("");
    const [roomSocket, setRoomSocket] = React.useState<WebSocket | null>(null);
    const [currentRoomState, handleNewCurrentRoomState] = React.useReducer(roomStateReducer, defaultRoomState);
    const showFlash = useFlash();
    useRoomEvent("error", (e: ErrorEvent) => {
        showFlash(e.message, "error");
    });

    (window as any).roomState = currentRoomState;

    useEffectOnce(() => {
        setErrorMsg("");
        const ws = joinRoom(
            roomId || "",
            handleNewCurrentRoomState,
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
                <div className={styles.room}>
                    <p className='error'>{errorMsg}</p>
                    <Game />
                    <Chat />
                </div>
            </RoomStateContext.Provider>
        </RoomSocketConnectionContext.Provider>
    );
};

export default Room;
