"use client";

import { createContext, useContext, useState } from "react";

const AlbumListRefreshContext = createContext(null);

export function AlbumListRefreshProvider({ children }) {
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshList = () => {
        setRefreshKey((value) => value + 1);
    };

    return (
        <AlbumListRefreshContext.Provider value={{ refreshKey, refreshList }}>
            {children}
        </AlbumListRefreshContext.Provider>
    );
}

export function useAlbumListRefresh() {
    return useContext(AlbumListRefreshContext);
}
