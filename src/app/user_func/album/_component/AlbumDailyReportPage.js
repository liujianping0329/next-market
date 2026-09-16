"use client";

import { useSearchParams } from "next/navigation";

import AlbumDailyReportContent from "./AlbumDailyReportContent";

const AlbumDailyReportPage = () => {
    const searchParams = useSearchParams();
    const reportId = searchParams.get("reportId");
    const userId = searchParams.get("userId");
    const targetDate = searchParams.get("targetDate");
    return (
        <main className="min-h-dvh bg-background px-4 py-5 sm:px-6">
            <div className="mx-auto max-w-3xl">
                {reportId ? (
                    <AlbumDailyReportContent reportId={reportId} />
                ) : (
                    <AlbumDailyReportContent userId={userId} targetDate={targetDate} />
                )}
            </div>
        </main>
    );
};

export default AlbumDailyReportPage;
