import React from "react";
import { deleteToken, getTokenData, updateUsername } from "../api";
import { useFlash } from "../hooks";
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
            <button
                onClick={() => {
                    deleteToken();
                    showFlash("Your account has been deleted", "success");
                }}
            >
                Clear data
            </button>
            <div>
                <label>
                    Volume: <input defaultValue={localStorage.volume || 1} type='range' min='0' max='1' step='0.1' onChange={e => localStorage.volume = e.currentTarget.valueAsNumber} />
                </label>
            </div>
        </Narrow>
    );
};

export default Settings;
