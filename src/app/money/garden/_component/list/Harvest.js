import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
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
            <div className="p-4  overflow-auto">
                <div className="flex flex-col flex-wrap h-300 content-start gap-3">
                    <div className="w-[50dvw] h-25">A</div>
                    <div className="w-[50dvw] h-25">B</div>
                    <div className="w-[50dvw] h-25">C</div>
                    <div className="w-[50dvw] h-25">A</div>
                    <div className="w-[50dvw] h-25">B</div>
                    <div className="w-[50dvw] h-25">C</div>
                    <div className="w-[50dvw] h-25">A</div>
                    <div className="w-[50dvw] h-25">B</div>
                    <div className="w-[50dvw] h-25">C</div>
                    <div className="w-[50dvw] h-25">A</div>
                    <div className="w-[50dvw] h-25">B</div>
                    <div className="w-[50dvw] h-25">C</div>
                </div>
            </div>
        </>
    );
}

export default Harvest;