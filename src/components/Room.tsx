import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { joinRoom } from "../api";

const Room = () => {
    const params = useParams();
    const roomId = params.id || "";
    const [errorMsg, setErrorMsg] = React.useState("");

    useEffect(() => {
        setErrorMsg("");
        return joinRoom(
            roomId || "",
            message => {
                console.log(message);
            },
            closeEvent => {
                setErrorMsg(closeEvent.reason);
            }
        );
    }, [roomId]);

    return <>{errorMsg}</>;
};

export default Room;
