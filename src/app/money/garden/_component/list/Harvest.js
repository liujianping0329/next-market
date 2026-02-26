import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState, useRef } from "react";
import FormSoy from "../form/FormSoy";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2, ChevronRight, ChevronsRight } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";
import FolderOpBar from "./soy/FolderOpBar";
import Datepicker from "@/components/datepicker";

const Harvest = () => {

    const timeConst = Array.from({ length: 14 }).map((_, i) => i + 8);     // 1-12 冻结列
    const rest = Array.from({ length: 98 }).map((_, i) => i + 1);           // 13+ 右侧滚动区
    const header = Array.from({ length: 8 }).map((_, i) => i);

    const headerScrollRef = useRef(null);
    const bodyScrollRef = useRef(null);

    return (
        <>
            <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        规划种草执行的记录，包含旅游计划等，记录执行情况和结果，方便以后回顾和总结。
                    </span>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center gap-3">
                            <Datepicker dateDf={new Date()} dtFormat="MM/dd" />
                            <ActionButton icon={ChevronRight} />
                            <ActionButton icon={ChevronsRight} />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-4 py-2 sticky top-0 z-30 bg-background border-b">
                <div ref={headerScrollRef}
                    className="h-[35px] gap-3 flex overflow-x-hidden items-center font-medium">
                    {header.map((n) => (
                        <div
                            key={n}
                            className={`
                                h-full border rounded flex items-center justify-center shrink-0
                                ${n === 0 ? "w-[36px]" : "w-[166px]"}
                            `}
                        >
                            {n}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4">
                <div className="flex gap-3">
                    {/* 左侧冻结列（不滚动） */}
                    <div className="grid gap-3 shrink-0 [grid-template-rows:repeat(14,50px)] w-[36px]">
                        {timeConst.map((n) => (
                            <div
                                key={n}
                                className="h-[50px] border rounded flex items-center justify-center"
                            >
                                {n}
                            </div>
                        ))}
                    </div>

                    {/* 右侧滚动区（横向滚动） */}
                    <div ref={bodyScrollRef}
                        onScroll={(e) => {
                            const fromEl = e.currentTarget;
                            const toEl = headerScrollRef.current;
                            toEl.scrollLeft = fromEl.scrollLeft;
                        }}
                        className="overflow-x-auto flex-1">
                        <div
                            className="min-w-max grid grid-flow-col gap-3 [grid-template-rows:repeat(14,50px)] auto-cols-[166px] " >
                            {rest.map((n) => (
                                <div
                                    key={n}
                                    className="h-[50px] border rounded flex items-center justify-center"
                                >
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Harvest;