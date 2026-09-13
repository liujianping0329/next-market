import { AlbumListRefreshProvider } from "./_component/AlbumListRefreshContext";

export default function AlbumLayout({ children, modal }) {
    return (
        <AlbumListRefreshProvider>
            {children}
            {modal}
        </AlbumListRefreshProvider>
    );
}
