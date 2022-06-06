import classNames from "classnames";
import * as React from "react";
import { useEvent } from "react-use";
import styles from "./Radial.module.scss";

export interface RadialProps {
    className?: string;
    children: React.ReactChild[];
}

const angleOffset = [Math.PI * 1.5, Math.PI / 2, Math.PI / 2.25];

const Radial: React.FC<RadialProps> = props => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const [, reRender] = React.useState([]);

    const processedChildren: React.ReactChild[] = [];
    const nGon = props.children.length;

    // Make sure it looks correct when resizing the window
    useEvent("resize", () => reRender([]));

    props.children.forEach((child, index) => {
        if (!rootRef || !rootRef.current) return;

        const currentAngleOffset = angleOffset[nGon - 1] || (Math.PI / (2 + (nGon - 1) / nGon))

        const angle = (index / nGon) * 2 * Math.PI + currentAngleOffset; // + ( || 0);
        const top = Math.sin(angle) * (rootRef.current.clientHeight / 2);
        const left = Math.cos(angle) * (rootRef.current.clientWidth / 2);
        processedChildren.push(
            <div className={styles.radialChild} style={{ top, left }}>
                {child}
            </div>
        );
    });

    return (
        <div className={styles.radialContainer}>
            <div ref={rootRef} className={classNames(props.className, styles.radial)}>
                {processedChildren}
            </div>
        </div>
    );
};

export default Radial;
