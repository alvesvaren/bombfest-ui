import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Link } from "react-router-dom";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getTokenData, updateUsername } from "./api";
import "./app.scss";
import Room from "./components/Room";
import Rooms from "./components/Rooms";

const Navbar = () => {
    const [username, setUsername] = React.useState("");

    return (
        <nav>
            <ul>
                <li>
                    <Link to='/rooms'>Bombfest</Link>
                </li>
                <li>
                    <form
                        onSubmit={async e => {
                            e.preventDefault();
                            await updateUsername(username);
                        }}
                    >
                        <input type='text' defaultValue={getTokenData()?.name} placeholder='Username' onChange={e => setUsername(e.currentTarget.value)} />
                    </form>
                </li>
            </ul>
        </nav>
    );
};

const LocalPlayerContext = React.createContext({});
const queryClient = new QueryClient({defaultOptions: {
    queries: {
        refetchInterval: 5000,
        refetchIntervalInBackground: true,

    }
}});

const App = () => {
    return (
        <LocalPlayerContext.Provider value={{}}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <Navbar />
                    <main>
                        <Routes>
                            <Route index element={<Navigate replace to='/rooms' />} />
                            <Route path='/rooms' element={<Rooms />} />
                            <Route path='/room/:id' element={<Room />} />

                            <Route path='*' element={<h1>404 Not found</h1>} />
                        </Routes>
                    </main>
                </BrowserRouter>
            </QueryClientProvider>
        </LocalPlayerContext.Provider>
    );
};

export default App;
