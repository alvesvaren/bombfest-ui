import classNames from "classnames";
import React from "react";
import { getTokenData, sendEvent } from "../api";
import { PlayerData } from "../interfaces";
import { useRoomSocket, useRoomState } from "./Room";

const Game = () => {
    const socket = useRoomSocket();
    const state = useRoomState();
    const localUuid = getTokenData()?.sub;
    const textInputRef = React.useRef<HTMLInputElement>(null);

    const playingPlayers = state.players.filter(player => state.playingPlayers.includes(player.uuid));

    const realPlayingPlayers = playingPlayers.filter(player => player.alive);
    const realPlayingPlayer: PlayerData | undefined = realPlayingPlayers[state.currentPlayerIndex % realPlayingPlayers.length];

    return (
        <>
            <h1>Game</h1>

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
                            <span className='text'> {player.text}</span>
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
                <input ref={textInputRef} type="text" onInput={() => {
                    if (socket && textInputRef.current?.value) {
                        sendEvent(socket, "text", { text: textInputRef.current.value });
                    }
                }} />
            </form>
        </>
    );
};

export default Game;
