import React from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../api";
import { useFlash } from "../App";
import Narrow from "../components/Narrow";
import { RoomData } from "../interfaces";

const NewRoom: React.FC = props => {
    const queryClient = useQueryClient();
    const roomFieldRef = React.useRef<HTMLInputElement>(null);
    const showFlash = useFlash();
    const navigate = useNavigate();

    return (
        <Narrow>
            <h1>New room</h1>
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    let data: RoomData | null = null;
                    if (roomFieldRef.current) {
                        try {
                            data = await createRoom(roomFieldRef.current.value);
                        } catch (e: any) {
                            showFlash(`Could not create room: ${e.message}`, "error");
                            return;
                        } finally {
                            roomFieldRef.current.value = "";
                        }
                        queryClient.invalidateQueries("rooms");
                        showFlash("Room created", "success");
                        navigate(`/room/${data.cuid}`)
                    }
                }}
            >
                <input type='text' ref={roomFieldRef} placeholder='New room name' />
                <input type='submit' value='Create' />
            </form>
            {props.children}
        </Narrow>
    );
};

export default NewRoom;
