import { Suspense } from "react";

import AlbumDailyReportPage from "../_component/AlbumDailyReportPage";

export default function AlbumReportPage() {
    return (
        <Suspense fallback={null}>
            <AlbumDailyReportPage />
        </Suspense>
    );
}
