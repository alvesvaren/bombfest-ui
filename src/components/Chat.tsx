import React from "react";
import { sendEvent } from "../api";
import { ChatMessage, useRoomSocket, useRoomState } from "./Room";

const Message = (props: { message: ChatMessage }) => {
    const roomState = useRoomState();
    const playerName = roomState.players.find(player => player.uuid === props.message.from)?.name;
    return (
        <>
            <li>
                {playerName}: {props.message.text}
            </li>
        </>
    );
};

const Chat = () => {
    const roomState = useRoomState();
    const roomSocket = useRoomSocket();
    const chatMessageFieldRef = React.useRef<HTMLInputElement>(null);
    return (
        <section className='chat'>
            <ul>
                {roomState.chat.map((message, index) => (
                    <Message key={index} message={message} />
                ))}
            </ul>

            <form
                onSubmit={e => {
                    e.preventDefault();
                    if (roomSocket && chatMessageFieldRef.current?.value) {
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
