import React from "react";
import { useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { createRoom, fetchRooms } from "../api";

const Rooms = () => {
    const { data, status } = useQuery("rooms", fetchRooms);
    const queryClient = useQueryClient();
    const roomFieldRef = React.useRef<HTMLInputElement>(null);

    return (
        <>
            <h1>Rooms</h1>
            <form onSubmit={async e => {
                e.preventDefault();
                if (roomFieldRef.current) {
                    await createRoom(roomFieldRef.current.value);
                    roomFieldRef.current.value = "";
                    queryClient.invalidateQueries("rooms");
                }
            }}>
                <input type="text" ref={roomFieldRef} placeholder="New room name"/>
                <input type="submit" value="Create" />
            </form>
            <ul>
                {status === "loading" && <li>Loading...</li>}
                {status === "error" && <li>Error!</li>}
                {data &&
                    data.map(room => (
                        <li key={room.cuid}>
                            <Link to={`/room/${room.cuid}`}>{room.name} ({room.player_count})</Link>
                        </li>
                    ))}
            </ul>
        </>
    );
};

export default Rooms;
