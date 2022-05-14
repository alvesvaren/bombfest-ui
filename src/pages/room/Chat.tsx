import React from "react";
import { sendEvent } from "../../api";
import { ChatMessage } from "../../interfaces";
import { useRoomSocket, useRoomState } from "./Room";
// import styles from "./Chat.module.scss";
import styles from "./Room.module.scss";

const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, { timeStyle: "short", hour12: false });
};

const Message = (props: { message: ChatMessage }) => {
    const roomState = useRoomState();
    const playerName = roomState.players.find(player => player.cuid === props.message.from)?.name;
    return (
        <article>
            <span>{formatDate(props.message.at)}</span> {playerName}: {props.message.text}
        </article>
    );
};

const Chat = () => {
    const roomState = useRoomState();
    const roomSocket = useRoomSocket();
    const chatMessageFieldRef = React.useRef<HTMLInputElement>(null);
    return (
        <section className={styles.chat}>
            <div>
                {roomState.chat.map((message, index, array) => (
                    <Message key={index} message={message} />
                ))}
            </div>

            <form
                className={styles.chatInput}
                onSubmit={e => {
                    e.preventDefault();
                    if (chatMessageFieldRef.current?.value) {
                        sendEvent(roomSocket, "chat", { text: chatMessageFieldRef.current.value });
                        chatMessageFieldRef.current.value = "";
                    }
                }}
            >
                <input type='text' placeholder='Enter chat message' ref={chatMessageFieldRef} />
            </form>
        </section>
    );
};

export default Chat;