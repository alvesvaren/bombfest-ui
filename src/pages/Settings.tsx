import React from "react";
import { getTokenData, updateUsername } from "../api";
import { useFlash } from "../App";
import Narrow from "../components/Narrow";

const Settings: React.FC = props => {
    const [formUsername, setFormUsername] = React.useState(getTokenData()?.name || "");
    const showFlash = useFlash();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateUsername(formUsername);
        showFlash("Your username has been updated", "success");
    };

    return (
        <Narrow>
            <h1>Settings</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    onChange={e => setFormUsername(e.currentTarget.value)}
                    data-legend='Username'
                    defaultValue={formUsername}
                    placeholder='Username'
                />
                <button type='submit'>Save</button>
            </form>
        </Narrow>
    );
};

export default Settings;
