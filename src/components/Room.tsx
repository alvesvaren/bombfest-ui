import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { joinRoom } from "../api";

const Room = () => {

    const params = useParams();
    const roomId = params.id || "";

    useEffect(() => {
        return joinRoom(roomId || "", (e) => {
            console.log(e);
        });
    }, [roomId]);

    return <></>;
};

export default Room;
