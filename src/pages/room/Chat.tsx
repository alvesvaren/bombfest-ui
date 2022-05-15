import React, { useEffect } from "react";
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
    const chatMessagesRef = React.useRef<HTMLDivElement>(null);
    const atChatBottom = React.useRef(true);

    const chatDep = JSON.stringify(roomState.chat);

    useEffect(() => {
        if (!chatMessagesRef.current) return;

        if (atChatBottom.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatDep, atChatBottom]);

    useEffect(() => {
        const scrollHandler = () => {
            const element = chatMessagesRef.current;
            if (!element) return;

            atChatBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight === 0;
        };
        const current = chatMessagesRef.current;
        current?.addEventListener("scroll", scrollHandler, { capture: false, passive: true });
        return () => current?.removeEventListener("scroll", scrollHandler);
    }, [chatMessagesRef]);

    return (
        <section className={styles.chat}>
            <div className={styles.chatMessages} ref={chatMessagesRef}>
                {roomState.chat.map((message, index, array) => (
                    <Message key={index} message={message} />
                ))}
            </div>
            <div className='spacer' />
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
