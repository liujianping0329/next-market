"use client";

import ky from "ky";
import Datepicker from "@/components/datepicker";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AlbumDailyAction = ({ date, userId, enable = true, list = [], onDateChange }) => {
    const pendingCount = list.filter((item) => item.status !== 2).length;
    const isAllVerified = pendingCount === 0;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [report, setReport] = useState(null);
    const [reportId, setReportId] = useState(null);
    const [isReportLoading, setIsReportLoading] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const getTargetDate = () => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const getReportGeneratedAt = () => {
        if (!report?.completed_at) return null;

        return new Date(report.completed_at).toLocaleString("sv-SE", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    useEffect(() => {
        let active = true;
        setIsReportLoading(true);

        ky.post("/api/album/daily-report/detail", {
            json: { userId, targetDate: getTargetDate() },
        }).json().then((response) => {
            if (active) {
                setReport(response.report);
                setReportId(response.report?.id ?? null);
            }
        }).catch(() => {
            if (active) {
                setReport(null);
                setReportId(null);
            }
        }).finally(() => {
            if (active) setIsReportLoading(false);
        });

        return () => {
            active = false;
        };
    }, [userId, date]);

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
            setReport(response.report);
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
                    disabled={isReportLoading || !report || !reportId}
                    onClick={() => setIsReportOpen(true)}
                    className="h-8 border-sky-200 px-2 text-xs text-sky-700 hover:bg-sky-50"
                >
                    查看日报
                </Button>
            </div>
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogContent className="max-h-[80dvh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{getTargetDate()} 饮食日报</DialogTitle>
                        {getReportGeneratedAt() && (
                            <p className="text-xs font-normal text-muted-foreground">
                                生成时间：{getReportGeneratedAt()}
                            </p>
                        )}
                    </DialogHeader>
                    {report?.status !== "completed" ? (
                        <p className="text-sm text-muted-foreground">日报正在生成，请耐心等待。</p>
                    ) : (
                        <div className="space-y-4 text-sm leading-6">
                            {report.summary && <p className="rounded-lg bg-sky-50 p-3 text-slate-700">{report.summary}</p>}
                            {[
                                ["早餐建议", report.breakfast_advice],
                                ["午餐建议", report.lunch_advice],
                                ["晚餐建议", report.dinner_advice],
                                ["后续注意", report.future_attention],
                            ].filter(([, content]) => content).map(([title, content]) => (
                                <section key={title}>
                                    <h3 className="font-semibold text-sky-800">{title}</h3>
                                    <p className="mt-1 text-muted-foreground">{content}</p>
                                </section>
                            ))}
                        </div>
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
