import React from "react";
import { useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { createRoom } from "../api";
import { useFlash } from "../hooks";
import Narrow from "../components/Narrow";
import { defaultRules, RoomCreationData, RoomData } from "../interfaces";
import styles from "./NewRoom.module.scss";

const NewRoom: React.FC = props => {
    const queryClient = useQueryClient();
    const showFlash = useFlash();
    const navigate = useNavigate();

    const [roomData, setRoomData] = React.useState<RoomCreationData>({
        name: "",
        isPrivate: false,
        lang: "en_US",
        rules: defaultRules,
    });

    return (
        <Narrow className={styles.wrapper}>
            <h1>New room</h1>
            <form
                onSubmit={async e => {
                    e.preventDefault();
                    let data: RoomData | null = null;
                        try {
                            data = await createRoom(roomData);
                        } catch (e: any) {
                            showFlash(
                                `Could not create room: ${e.message}`,
                                "error"
                            );
                            return;
                        }
                        queryClient.invalidateQueries("rooms");
                        showFlash("Room created", "success");
                        navigate(`/room/${data.cuid}`);
                }}
            >
                <label>
                    <span>Room name:</span>
                    <input
                        type="text"
                        placeholder="New room name"
                        onChange={e =>
                            setRoomData({
                                ...roomData,
                                name: e.currentTarget.value,
                            })
                        }
                    />
                </label>
                <label>
                    <span>Language:</span>
                    <select
                        value={roomData.lang}
                        onChange={e =>
                            setRoomData({
                                ...roomData,
                                lang: e.currentTarget.value as any,
                            })
                        }
                    >
                        <option value="en_US">English</option>
                        <option value="sv_SE">Swedish</option>
                    </select>
                </label>
                <label>
                    <span>WPP Interval:</span>
                    <input
                        type="number"
                        placeholder="Min WPP"
                        onChange={e =>
                            setRoomData({
                                ...roomData,
                                rules: {
                                    ...roomData.rules,
                                    minWordsPerPrompt: +e.currentTarget.value,
                                },
                            })
                        }
                    />
                    <input
                        type="number"
                        placeholder="Max WPP"
                        onChange={e =>
                            setRoomData({
                                ...roomData,
                                rules: {
                                    ...roomData.rules,
                                    maxWordsPerPrompt: +e.currentTarget.value,
                                },
                            })
                        }
                    />
                </label>
                <label>
                    <span>Private room:</span>
                    <input
                        type="checkbox"
                        checked={roomData.isPrivate}
                        onChange={e =>
                            setRoomData({
                                ...roomData,
                                isPrivate: e.currentTarget.checked,
                            })
                        }
                    />
                </label>
                <div>
                    <p className="small">wpp = words per prompt</p>
                    <p className="small">
                        min / max wpp - minimum / maximum count of words
                        matching each prompt
                    </p>
                    <p className="small">
                        private rooms will not appear in the room list
                    </p>
                </div>
                <input type="submit" value="Create" />
            </form>
            {props.children}
        </Narrow>
    );
};

export default NewRoom;
