import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Link } from "react-router-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useLocalStorage } from "./hooks";
import { getTokenData, updateUsername } from "./api";
import "./app.scss";
import Room from "./components/Room";
import Rooms from "./components/Rooms";
import { TokenData } from "./interfaces";

const debounce = (callback: (...args: any) => void, delay = 500) => {
    let timeout: NodeJS.Timeout;

    return (...args: any) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};

const debouncedUpdateUsername = debounce(updateUsername);

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li>
                    <Link to='/rooms'>Bombfest</Link>
                </li>
                <li>
                    <input
                        type='text'
                        defaultValue={getTokenData()?.name}
                        placeholder='Username'
                        onInput={async e => debouncedUpdateUsername(e.currentTarget.value)}
                        onBlur={async e => await updateUsername(e.currentTarget.value)}
                    />
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

const App = () => {
    const token = useLocalStorage("token");
    const [tokenData, setTokenData] = useState<TokenData | null>(null);

    console.log(token);

    useEffect(() => {
        if (token) {
            setTokenData(getTokenData());
        }
    }, [token]);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Navbar />
                <main>
                    <Routes>
                        {tokenData?.name ? (
                            <>
                                <Route index element={<Navigate replace to='/rooms' />} />
                                <Route path='/rooms' element={<Rooms />} />
                                <Route path='/room/:id' element={<Room />} />

                                <Route path='*' element={<h1>404 Not found</h1>} />
                            </>
                        ) : (
                            <Route path='*' element={<div>Enter a username before playing</div>} />
                        )}
                    </Routes>
                </main>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
