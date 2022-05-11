import React from "react";

export const useLocalStorage = (key: string) => {
    const [value, setValue] = React.useState(localStorage.getItem(key));
    React.useEffect(() => {
        const eventHandler = (e: StorageEvent) => {
            console.log(e);
            e.storageArea === localStorage && e.key === key && setValue(e.newValue);
        };

        window.addEventListener("storage", eventHandler);

        return () => window.removeEventListener("storage", eventHandler);
    }, [key]);

    return value;
};
