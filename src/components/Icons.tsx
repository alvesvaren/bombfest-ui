import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faGamepad, faBomb, faPlus, faHeart, faPlay, faUsers, faCog, faTimes, faSkullCrossbones } from "@fortawesome/free-solid-svg-icons";
import styled, { keyframes } from "styled-components";

const bomb = <Icon icon={faBomb} />;
const plus = <Icon icon={faPlus} />;
const heart = <Icon icon={faHeart} />;
const play = <Icon icon={faPlay} />;
const users = <Icon icon={faUsers} />;
const cog = <Icon icon={faCog} />;
const gamepad = <Icon icon={faGamepad} />;
const cross = <Icon icon={faTimes} />;
const skull = <Icon icon={faSkullCrossbones} />;
// const tickingBomb = <Icon icon={faBomb} className="ticking" />;

const _ticking = keyframes`
    5% { transform: scale(1.1) scaleX(1.05) rotate(-5deg) }
    100% { transform: scale(1) scaleX(0.95) rotate(3deg) }`;

const TickingBomb = styled(Icon).attrs({ icon: faBomb })`
    animation: ${_ticking} 0.25s infinite;
`;

const tickingBomb = <TickingBomb />;

export { bomb, plus, heart, play, users, cog, gamepad, cross, tickingBomb, skull };
