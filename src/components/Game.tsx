import classNames from "classnames";
import React, { useEffect } from "react";
import { getTokenData, sendEvent } from "../api";
import { PlayerData } from "../interfaces";
import { useRoomSocket, useRoomState } from "./Room";

const Game = () => {
    const socket = useRoomSocket();
    const state = useRoomState();
    const localUuid = getTokenData()?.sub;
    const [timeLeft, setTimeLeft] = React.useState(0);
    const textInputRef = React.useRef<HTMLInputElement>(null);

    const playingPlayers = state.players.filter(player => state.playingPlayers.includes(player.uuid));

    const realPlayingPlayers = playingPlayers.filter(player => player.alive);
    const realPlayingPlayer: PlayerData | undefined = realPlayingPlayers[state.currentPlayerIndex % realPlayingPlayers.length];
    const isLocalTurn = realPlayingPlayer?.uuid === localUuid;
    
    useEffect(() => {
        const startAt = state.startAt;
        if (startAt) {
            const id = setInterval(() => {
                setTimeLeft(startAt - (new Date()).getTime());
            }, 1000);

            return () => clearInterval(id);
        }

    }, [state.startAt])

    return (
        <>
            <h1>Game</h1>

            {timeLeft > 0 && <div>{Math.ceil(timeLeft/1000)} seconds left until game starts</div>}

            {!playingPlayers.map(player => player.uuid).includes(localUuid || "") && (
                <button
                    onClick={() => {
                        if (socket) {
                            sendEvent(socket, "play", {});
                        }
                    }}
                >
                    Join
                </button>
            )}

            <h2>Write a word containing: {state.prompt}</h2>

            <div className='players'>
                {playingPlayers.map((player, index) => {
                    return (
                        <div
                            className={classNames({ current: player.uuid === realPlayingPlayer?.uuid, dead: !player.alive, disconnected: !player.connected })}
                            key={index}
                        >
                            <span className='name'>
                                {player.name} ({player.lives} hp):
                            </span>
                            {state.prompt && <span className='text'> {(() => {
                                const parts: React.ReactNode[] = player.text.split(state.prompt);
                                const newParts: typeof parts = [];
                                let hasInserted = false;
                                parts.forEach(part => {
                                    if (part) {
                                        newParts.push(part);
                                    }
                                    if (!hasInserted) {
                                        newParts.push(<span className='matching'>{state.prompt}</span>);
                                        hasInserted = true;
                                    } else {
                                        newParts.push(state.prompt);
                                    }
                                })
                                newParts.pop();
                                return newParts;
                            })()}</span>}
                            
                        </div>
                    );
                })}
            </div>

            <form onSubmit={
                e => {
                    e.preventDefault();
                    if (socket && textInputRef.current?.value) {
                        sendEvent(socket, "submit", { text: textInputRef.current.value });
                        textInputRef.current.value = "";
                    }
                }
            }>
                <input ref={textInputRef} type="text" disabled={!isLocalTurn} onInput={() => {
                    if (socket && textInputRef.current?.value) {
                        sendEvent(socket, "text", { text: textInputRef.current.value });
                    }
                }} />
            </form>
        </>
    );
};

export default Game;
