import classNames from "classnames";
import React, { useEffect } from "react";
import { gameEmitter, getTokenData, sendEvent } from "../../api";
import { EndBroadcastEvent, IncorrectBroadcastEvent, PlayerData } from "../../interfaces";
import { useRoomEvent, useRoomSocket, useRoomState } from "./Room";
import sounds from "../../sounds";
import styles from "./Room.module.scss";

import useSound from "use-sound";
import useAnimated from "../../components/Animated";
import { useFlash } from "../../hooks";

const PlayerText = (props: { player: PlayerData }) => {
    const { player } = props;
    const state = useRoomState();
    const { playingPlayer } = usePlayingPlayers();
    const [Shake, startShake] = useAnimated("shake");

    useEffect(() => {
        const handleIncorrect = (e: IncorrectBroadcastEvent["data"]) => {
            if (e.for === player.cuid) {
                startShake();
            }
        };

        gameEmitter.addListener("incorrect", handleIncorrect);
        return () => void gameEmitter.removeListener("incorrect", handleIncorrect);
    });
    return (
        <div className={classNames({ current: player.cuid === playingPlayer?.cuid, dead: !player.alive, disconnected: !player.connected })}>
            <span className='name'>
                {player.name} ({player.lives} hp):{" "}
            </span>
            <Shake>
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
            </Shake>
        </div>
    );
};

const usePlayingPlayers = () => {
    const state = useRoomState();
    const playingPlayers = state.players.filter(player => state.playingPlayers.includes(player.cuid)) || [];
    const playingPlayer = state.players.find(player => state.currentPlayer === player.cuid);
    return { playingPlayers, playingPlayer };
};

const Game = () => {
    const socket = useRoomSocket();
    const state = useRoomState();
    const localUuid = getTokenData()?.sub;
    const [timeLeft, setTimeLeft] = React.useState(0);
    const textInputRef = React.useRef<HTMLInputElement>(null);
    // const [playNext] = useSound(sounds.next);
    const [playCorrect] = useSound(sounds.tick, { volume: 0.008 });
    const [playIncorrect] = useSound(sounds.fail, { volume: 0.002 });
    const showFlash = useFlash();

    const handleEnd = (data: EndBroadcastEvent["data"]) => {
        showFlash(`Game over! ${state.players.find(player => data.winner === player.cuid)?.name} won!`, "success");
    }

    useRoomEvent("correct", playCorrect);
    useRoomEvent("incorrect", playIncorrect);

    useRoomEvent("end", handleEnd);

    const { playingPlayers, playingPlayer } = usePlayingPlayers();
    const isLocalTurn = playingPlayer?.cuid === localUuid;
    useEffect(() => {
        if (isLocalTurn) {
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 0);
        }
    }, [isLocalTurn]);

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

    console.log(state.isPlaying);

    return (
        <div className={styles.game}>
            <div className={styles.board}>
                {timeLeft > 0 && <div className='game-status'>{Math.ceil(timeLeft / 1000)} seconds left until game starts</div>}
                {waitingForPlayers && <div className='game-status'>Waiting for players...</div>}
                {!playingPlayers.map(player => player.cuid).includes(localUuid || "") && !state.isPlaying && (
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
                    return <PlayerText key={index} player={player} />;
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
