import classNames from "classnames";
import React from "react";
import { FlashMessage } from "../App";
import * as Icons from './Icons';

const FlashMessageCard: React.FC<{message?: FlashMessage, clearFlash: () => void}> = props => {
    const { message, clearFlash } = props;
    if (!message) {
        return <></>;
    }

    const icon = Icons[message.type];

    return (
        <div className={classNames("flash", message.type)}>
            <div className="flash-icon flat inline">{icon}</div>
            <span>{message.text}</span>
            <button className="flat inline squared" onClick={clearFlash}>{Icons.cross}</button>
        </div>
    );
};

export default FlashMessageCard;
