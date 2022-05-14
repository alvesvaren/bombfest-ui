import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { fetchRooms, friendlyDictNames } from "../api";
import { RoomData } from "../interfaces";
import * as Icons from "../components/Icons";
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

    return (
        <Narrow>
            <div className="split">
                <h1>Rooms</h1>
                <div className="create-new-room">Create room <Link to="/rooms/new" className="inline button">{Icons.plus}</Link> </div>
            </div>

            <RoomList />
        </Narrow>
    );
};

export default Rooms;
