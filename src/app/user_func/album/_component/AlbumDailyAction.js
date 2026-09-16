"use client";

import ky from "ky";
import Datepicker from "@/components/datepicker";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import AlbumDailyReportContent from "./AlbumDailyReportContent";

const AlbumDailyAction = ({ date, userId, enable = true, list = [], onDateChange }) => {
    const pendingCount = list.filter((item) => item.status !== 2).length;
    const isAllVerified = pendingCount === 0;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportId, setReportId] = useState(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const getTargetDate = () => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const generateDailyReport = async () => {
        if (isSubmitting) return;

        const targetDate = getTargetDate();

        setIsSubmitting(true);

        try {
            const response = await ky.post("/api/album/daily-report", {
                json: {
                    userId,
                    targetDate,
                    albumIds: list.map((item) => item.id),
                },
            }).json();
            setReportId(response.reportId);
            toast.success("日报已提交，请耐心等待");
        } catch {
            toast.error("日报提交失败，请稍后重试");
        } finally {
            setIsSubmitting(false);
        }
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
                    disabled={!isAllVerified || isSubmitting}
                    onClick={generateDailyReport}
                    className="h-8 bg-sky-600 px-2 text-xs text-white hover:bg-sky-700"
                >
                    生成日报
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!userId}
                    onClick={() => setIsReportOpen(true)}
                    className="h-8 border-sky-200 px-2 text-xs text-sky-700 hover:bg-sky-50"
                >
                    查看日报
                </Button>
            </div>
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="h-dvh w-dvw max-w-none overflow-y-auto rounded-none border-0 p-6 sm:p-8">
                    <DialogTitle className="sr-only">饮食日报</DialogTitle>
                    {reportId ? (
                        <AlbumDailyReportContent reportId={reportId} />
                    ) : (
                        <AlbumDailyReportContent userId={userId} targetDate={getTargetDate()} />
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">关闭</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default AlbumDailyAction;
