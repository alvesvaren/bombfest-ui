import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Link } from "react-router-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useUnmount } from "react-use";
import "./app.scss";
import Room from "./components/Room";
import Rooms from "./components/Rooms";
import Settings from "./pages/Settings";

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to='/rooms'>Bombfest</Link>
                </li>
                <li>
                    <Link to='/settings'>Settings</Link>
                </li>
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

export const useFlash = () => {
    const context = React.useContext(FlashContext);
    const showFlash = (text: FlashMessage["text"], type: FlashMessage["type"] = "info") => context({ text, type });
    return showFlash;
};

const App = () => {
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
                    <Navbar />
                    <main>
                        <Routes>
                            <Route index element={<Navigate replace to='/rooms' />} />
                            <Route path='/rooms' element={<Rooms />} />
                            <Route path='/room/:id' element={<Room />} />
                            <Route path='/settings' element={<Settings />} />

                            <Route path='*' element={<h1>404 Not found</h1>} />
                        </Routes>
                    </main>
                </BrowserRouter>
            </QueryClientProvider>
            {message && (
                <div className={`flash ${message.type}`}>
                    <p>{message.text}</p>
                </div>
            )}
        </FlashContext.Provider>
    );
};

export default App;