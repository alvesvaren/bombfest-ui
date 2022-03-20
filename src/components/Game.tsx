import classNames from "classnames";
import React, { useEffect } from "react";
import { getTokenData, sendEvent } from "../api";
import { PlayerData } from "../interfaces";
import { useRoomSocket, useRoomState } from "./Room";
import sounds from "../sounds";

import useSound from "use-sound";

const PlayerText = (props: { player: PlayerData }) => {
    const { player } = props;
    const state = useRoomState();
    const { playingPlayer } = usePlayingPlayers();
    return (
        <div className={classNames({ current: player.uuid === playingPlayer.uuid, dead: !player.alive, disconnected: !player.connected })}>
            <span className='name'>
                {player.name} ({player.lives} hp):{" "}
            </span>
            {state.prompt && (
                <span className='text'>
                    {(() => {
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
                        });
                        newParts.pop();
                        return newParts;
                    })()}
                </span>
            )}
        </div>
    );
};

const usePlayingPlayers = () => {
    const state = useRoomState();
    const playingPlayers = state.players.filter(player => state.playingPlayers.includes(player.uuid)) || [];

    const playingPlayer: PlayerData | undefined = playingPlayers[state.currentPlayerIndex % playingPlayers.length];

    return { playingPlayers, playingPlayer };
}

const Game = () => {
    const socket = useRoomSocket();
    const state = useRoomState();
    const localUuid = getTokenData()?.sub;
    const [timeLeft, setTimeLeft] = React.useState(0);
    const textInputRef = React.useRef<HTMLInputElement>(null);
    // const [playNext] = useSound(sounds.next);
    const [playCorrect] = useSound(sounds.correct);
    const [playIncorrect] = useSound(sounds.incorrect);

    document.addEventListener("incorrect", () => void playIncorrect());
    document.addEventListener("correct", () => void playCorrect());

    const { playingPlayers, playingPlayer } = usePlayingPlayers();
    const isLocalTurn = playingPlayer?.uuid === localUuid;

    const waitingForPlayers = playingPlayers.length < 2;

    useEffect(() => {
        const startAt = state.startAt;
        if (startAt) {
            const id = setInterval(() => {
                setTimeLeft(startAt - new Date().getTime());
            }, 1000);

            return () => clearInterval(id);
        }
    }, [state.startAt]);

    return (
        <div className='game'>
            <div className='board'>
                {timeLeft > 0 && <div className='game-status'>{Math.ceil(timeLeft / 1000)} seconds left until game starts</div>}
                {waitingForPlayers && <div className='game-status'>Waiting for players...</div>}
                {!playingPlayers.map(player => player.uuid).includes(localUuid || "") && (
                    <button
                        onClick={() => {
                            sendEvent(socket, "play", {});
                        }}
                    >
                        Join
                    </button>
                )}
                {state.prompt && <h2>{state.prompt}</h2>}
                {playingPlayers.map((player, index) => {
                    return (
                        <PlayerText key={index} player={player} />
                    );
                })}
            </div>

            <form
                className='game-input'
                onSubmit={e => {
                    e.preventDefault();
                    if (textInputRef.current) {
                        sendEvent(socket, "submit", { text: textInputRef.current.value });
                        textInputRef.current.value = "";
                    }
                }}
            >
                <input
                    ref={textInputRef}
                    type='text'
                    disabled={!isLocalTurn}
                    onInput={() => {
                        if (textInputRef.current) {
                            sendEvent(socket, "text", { text: textInputRef.current.value });
                        }
                    }}
                />
            </form>
        </div>
    );
};

export default Game;
