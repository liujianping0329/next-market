"use client";

import ky from "ky";
import Datepicker from "@/components/datepicker";
import { Button } from "@/components/ui/button";

const AlbumDailyAction = ({ date, userId, enable = true, list = [], onDateChange }) => {
    const pendingCount = list.filter((item) => item.status !== 2).length;
    const isAllVerified = pendingCount === 0;

    const generateDailyReport = async () => {
        const targetDate = [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0"),
        ].join("-");

        await ky.post("/api/album/daily-report", {
            json: {
                userId,
                targetDate,
                albumIds: list.map((item) => item.id),
            },
        });
    };

    return (
        <section className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-1.5">
            <div className="relative w-20 [&_input]:h-8 [&_input]:px-2 [&_input]:text-xs">
                <Datepicker
                    dateDf={date}
                    dtFormat="MM/dd"
                    onChange={onDateChange || (() => { })}
                />
                {!enable && <div className="absolute inset-0 z-10 cursor-not-allowed" />}
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isAllVerified ? "text-emerald-600" : "text-amber-600"
                    }`}>
                    {isAllVerified ? "已全部校对" : `${pendingCount} 件待校对`}
                </span>
                <Button
                    type="button"
                    size="sm"
                    disabled={!isAllVerified}
                    onClick={generateDailyReport}
                    className="h-8 bg-sky-600 px-2 text-xs text-white hover:bg-sky-700"
                >
                    生成日报
                </Button>
            </div>
        </section>
    );
};

export default AlbumDailyAction;
