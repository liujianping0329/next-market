"use client";

export const revalidate = 0;
import CommonHeader from "../_component/common_header";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { MessageSquarePlus, Orbit } from "lucide-react";
import { useRef } from "react";

const AlbumUI = ({ }) => {

    const inputRef = useRef(null);

    const handleChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("照片:", file);
    };
    return (
        <>
            <CommonHeader>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleChange}
                />
                <Button variant="outline" className="p-3" onClick={() => inputRef.current?.click()}>
                    <MessageSquarePlus className="h-4 w-4" />
                    <span>新建图片</span>
                </Button>
            </CommonHeader>
        </>
    );
}
export default AlbumUI;