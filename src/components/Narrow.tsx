import classNames from "classnames";
import React from "react";

const Narrow: React.FC<{ className?: string }> = props => {
    return <section className={classNames("narrow", props.className)}>{props.children}</section>;
};

export default Narrow;
