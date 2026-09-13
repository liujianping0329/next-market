import { Suspense } from "react";

import AlbumUI from './pageUI';

export function Album() {
    return (
        <Suspense fallback={null}>
            <AlbumUI />
        </Suspense>
    );
}
export default Album;
