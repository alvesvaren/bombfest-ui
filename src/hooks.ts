import React from "react";
import { authEmitter, getTokenData } from "./api";
import { FlashContext, FlashMessage } from "./App";
import { TokenData } from "./interfaces";

export const useLocalStorage = (key: string) => {
    const [value, setValue] = React.useState(localStorage.getItem(key));
    React.useEffect(() => {
        const eventHandler = (e: StorageEvent) => {
            e.storageArea === localStorage && e.key === key && setValue(e.newValue);
        };

        window.addEventListener("storage", eventHandler);

        return () => window.removeEventListener("storage", eventHandler);
    }, [key]);

    return value;
};

export const useFlash = () => {
    const context = React.useContext(FlashContext);
    const showFlash = (text: FlashMessage["text"], type: FlashMessage["type"] = "info") => context({ text, type });
    return showFlash;
};

export const useTokenData = () => {
    const [tokenData, setTokenData] = React.useState<TokenData | null>(getTokenData());

    React.useEffect(() => {
        setTokenData(getTokenData());
        const handler = (e?: StorageEvent) => {
            if (!e || (e?.storageArea === localStorage && e?.key === "token")) {
                setTokenData(getTokenData());
            }
        };

        window.addEventListener("storage", handler);
        authEmitter.addListener("auth-changed", handler);

        return () => {
            window.removeEventListener("storage", handler);
            authEmitter.removeListener("auth-changed", handler);
        };
    }, []);

    return tokenData;
};

export const useLoggedIn = () => {
    const tokenData = useTokenData();
    const isLoggedIn = !!tokenData?.sub;

    return isLoggedIn;
};
