import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { createRoom, fetchRooms, friendlyDictNames } from "../api";
import { RoomData } from "../interfaces";
import * as Icons from "../components/icons";
import { useFlash } from "../App";
import Narrow from "../components/Narrow";

const RoomCard: React.FC<{ room: RoomData }> = props => {
    const { room } = props;
    return (
        <article className='card listed-room'>
            <h1>{room.name}</h1>
            <p>
                {friendlyDictNames[room.language]} · {room.player_count} {Icons.users}
                <span className='spacer' />
            </p>
            <Link className='inline play-button card-link button' to={`/room/${props.room.cuid}`}>
                {Icons.play}
            </Link>
        </article>
    );
};

const RoomList: React.FC = props => {
    const { data, status } = useQuery("rooms", fetchRooms);

    return (
        <section id='room-list'>
            {status === "loading" && <li>Loading rooms...</li>}
            {status === "error" && <li>Could not fetch rooms. Try again later</li>}
            {data && data.map(room => <RoomCard room={room} key={room.cuid} />)}
        </section>
    );
};

const Rooms = () => {
    const queryClient = useQueryClient();
    const roomFieldRef = React.useRef<HTMLInputElement>(null);
    const showFlash = useFlash();

    return (
        <Narrow>
            <h1>Rooms</h1>
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    if (roomFieldRef.current) {
                        try {
                            await createRoom(roomFieldRef.current.value);
                        } catch (e: any) {
                            showFlash(`Could not create room: ${e.message}`, "error");
                        }
                        roomFieldRef.current.value = "";
                        queryClient.invalidateQueries("rooms");
                    }
                }}
            >
                <input type='text' ref={roomFieldRef} placeholder='New room name' />
                <input type='submit' value='Create' />
            </form>
            <RoomList />
        </Narrow>
    );
};

export default Rooms;
