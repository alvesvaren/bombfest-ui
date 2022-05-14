export type Mapping = { [key: string]: string | undefined | null };

export const searchParams = (params: Mapping) => {
    let searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (typeof value === "string") {
            searchParams.set(key, value);
        }
    });
    if (searchParams.toString() === "") return "";
    return "?" + searchParams.toString();
};
