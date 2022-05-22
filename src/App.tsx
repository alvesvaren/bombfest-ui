import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useUnmount } from "react-use";
import { executeCommand, getTokenData, updateUsername } from "./api";
import "./app.scss";
import FlashMessageCard from "./components/FlashMessageCard";
import * as Icons from "./components/Icons";
import Narrow from "./components/Narrow";
import Room from "./pages/room/Room";
import { useFlash, useLoggedIn } from "./hooks";
import NewRoom from "./pages/NewRoom";
import Rooms from "./pages/Rooms";
import Settings from "./pages/Settings";
import { searchParams } from "./searchparams";
import commands from "./commandParser";
import classNames from "classnames";
import styles from "./App.module.scss";

const Navbar = () => {
    const isLoggedIn = useLoggedIn();
    return (
        <nav>
            <ul className='split'>
                <li className='bold'>
                    <Link to='/rooms'>{Icons.bomb} Bombfest</Link>
                </li>
                {isLoggedIn && (
                    <li>
                        <Link to='/settings'>{Icons.cog}</Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchInterval: 5000,
            refetchIntervalInBackground: true,
        },
    },
});

export interface FlashMessage {
    text: string;
    type: "success" | "error" | "info" | "warning";
}

export const FlashContext = React.createContext<(message: FlashMessage) => void>(() => {});

const Index = () => {
    const [formUsername, setFormUsername] = React.useState(getTokenData()?.name || "");
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const returnTo = new URLSearchParams(location.search).get("return");

        await updateUsername(formUsername);
        navigate(returnTo || "/rooms");
    };

    return (
        <Narrow className="center column">
            <h1 className={classNames("center", styles.title)}>{Icons.tickingBomb} Bombfest</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    onChange={e => setFormUsername(e.currentTarget.value)}
                    data-legend='Username'
                    defaultValue={formUsername}
                    placeholder='Username'
                />
                <button type='submit'>Join</button>
            </form>
        </Narrow>
    );
};

const App = () => {
    const isLoggedIn = useLoggedIn();
    const location = useLocation();
    const showFlash = useFlash();

    React.useEffect(() => {
        commands.flash = {
            callback: async (message: string, type: string) => {
                showFlash(message, type as any);
                return "";
            },
            help: "Show a flash message",
        };

        return () => {
            delete commands.flash;
        };
    }, [showFlash]);

    if (!isLoggedIn && location.pathname !== "/") {
        return <Navigate to={{ pathname: "/", search: searchParams({ return: location.pathname }) }} />;
    }

    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route index element={isLoggedIn ? <Navigate replace to='/rooms' /> : <Index />} />
                    <Route path='/rooms' element={<Rooms />} />
                    <Route path='/rooms/new' element={<NewRoom />} />
                    <Route path='/room/:id' element={<Room />} />
                    <Route path='/settings' element={<Settings />} />

                    <Route
                        path='*'
                        element={
                            <Narrow>
                                <h1>404 Not found</h1>
                            </Narrow>
                        }
                    />
                </Routes>
            </main>
        </>
    );
};

const WrappedApp = () => {
    const [message, setMessage] = React.useState<FlashMessage | undefined>();
    let flashTimeout = React.useRef<number>(-1);

    const showMessage = (newMessage: FlashMessage) => {
        setMessage(newMessage);
        window.clearTimeout(flashTimeout.current);
        flashTimeout.current = window.setTimeout(() => setMessage(undefined), 5000);
    };

    useUnmount(() => {
        window.clearTimeout(flashTimeout.current);
    });

    return (
        <FlashContext.Provider value={showMessage}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                    <FlashMessageCard key={flashTimeout.current} clearFlash={() => setMessage(undefined)} message={message} />
                </BrowserRouter>
            </QueryClientProvider>
        </FlashContext.Provider>
    );
};

(window as any).executeCommand = (...args: [any]) => void executeCommand(...args).then(console.log);

export default WrappedApp;
