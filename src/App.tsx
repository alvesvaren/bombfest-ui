import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Link, useLocation } from "react-router-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useUnmount } from "react-use";
import { getTokenData, updateUsername } from "./api";
import "./app.scss";
import FlashMessageCard from "./components/FlashMessageCard";
import * as Icons from "./components/Icons";
import Narrow from "./components/Narrow";
import Room from "./pages/room/Room";
import { useLoggedIn } from "./hooks";
import NewRoom from "./pages/NewRoom";
import Rooms from "./pages/Rooms";
import Settings from "./pages/Settings";
import { searchParams } from "./searchparams";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        await updateUsername(formUsername);
    };

    return (
        <Narrow>
            <h1>{Icons.tickingBomb} Bombfest</h1>
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

    if (!isLoggedIn && location.pathname !== "/") {
        return <Navigate to='/' />;
    }

    return (
        <>
            <Navbar />
            <main>
                <Routes>
                    <Route path='*' element={isLoggedIn ? "" : <Navigate to={{ pathname: "/", search: searchParams({ return: location.pathname }) }} />} />
                    <Route index element={isLoggedIn ? <Navigate replace to='/rooms' /> : <Index />} />
                    <Route path='/rooms' element={<Rooms />} />
                    <Route path='/rooms/new' element={<NewRoom />} />
                    <Route path='/room/:id' element={<Room />} />
                    <Route path='/settings' element={<Settings />} />

                    <Route path='*' element={<h1>404 Not found</h1>} />
                </Routes>
            </main>
        </>
    );
};

const WrappedApp = () => {
    const [message, setMessage] = React.useState<FlashMessage | undefined>();
    let flashTimeout: number | undefined;

    const showMessage = (newMessage: FlashMessage) => {
        setMessage(newMessage);
        window.clearTimeout(flashTimeout);
        flashTimeout = window.setTimeout(() => setMessage(undefined), 5000);
    };

    useUnmount(() => {
        window.clearTimeout(flashTimeout);
    });

    return (
        <FlashContext.Provider value={showMessage}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                    <FlashMessageCard clearFlash={() => setMessage(undefined)} message={message} />
                </BrowserRouter>
            </QueryClientProvider>
        </FlashContext.Provider>
    );
};

export default WrappedApp;
