import classNames, { Argument } from "classnames";
import React from "react";

type internalAnimationComponent = React.FC<{ className?: string }>;

const useAnimated = (animatedClass: string): [internalAnimationComponent, () => void] => {
    const [animating, setAnimating] = React.useState(false);

    const start = () => setAnimating(true);
    
    const classes: Argument = {};
    classes[animatedClass] = animating;

    const internalComponent: internalAnimationComponent = props => {
        return (
            <div onAnimationEnd={() => void setAnimating(false)} className={classNames(props.className, classes)}>
                {props.children}
            </div>
        );
    };


    return [internalComponent, start];
};

export default useAnimated;
