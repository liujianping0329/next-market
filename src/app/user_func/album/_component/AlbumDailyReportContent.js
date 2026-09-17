"use client";

import ky from "ky";
import { useEffect, useState } from "react";

import DailyNutritionTargetDashboard from "./DailyNutritionTargetDashboard";

const AlbumDailyReportContent = ({ reportId, userId, targetDate }) => {
    const [report, setReport] = useState(null);
    const [nutritionTarget, setNutritionTarget] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const requestBody = reportId
            ? { reportId }
            : { userId, targetDate };

        if (!reportId && (!userId || !targetDate)) {
            setIsLoading(false);
            return;
        }

        let active = true;
        setIsLoading(true);

        ky.post("/api/album/daily-report/detail", { json: requestBody }).json()
            .then((response) => {
                if (active) {
                    setReport(response.report);
                    setNutritionTarget(response.nutritionTarget);
                }
            })
            .catch(() => {
                if (active) {
                    setReport(null);
                    setNutritionTarget(null);
                }
            })
            .finally(() => {
                if (active) setIsLoading(false);
            });

        return () => {
            active = false;
        };
    }, [reportId, userId, targetDate]);

    const displayDate = targetDate || report?.target_date;
    const generatedAt = report?.completed_at
        ? new Date(report.completed_at).toLocaleString("sv-SE", {
            timeZone: "Asia/Tokyo",
            hour12: false,
        })
        : null;

    const content = (() => {
    if (isLoading) {
        return <p className="text-sm text-muted-foreground">日报加载中...</p>;
    }

    if (!report) {
        return <p className="text-sm text-muted-foreground">暂无日报</p>;
    }

    if (report.status !== "completed") {
        return <p className="text-sm text-muted-foreground">日报正在生成中，请耐心等待。</p>;
    }

    return (
        <div className="space-y-4 text-sm leading-6">
            {report.summary && <p className="rounded-lg bg-sky-50 p-3 text-slate-700">{report.summary}</p>}
            <DailyNutritionTargetDashboard report={report} target={nutritionTarget} />
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
    );
    })();

    return (
        <div>
            <header className="mb-6">
                <h2 className="text-lg font-semibold">{displayDate ? `${displayDate} 饮食日报` : "饮食日报"}</h2>
                {generatedAt && <p className="mt-1 text-xs text-muted-foreground">生成时间：{generatedAt}</p>}
            </header>
            {content}
        </div>
    );
};

export default AlbumDailyReportContent;
