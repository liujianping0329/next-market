"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import ky from "ky";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormGarden from "./_component/form/FormGarden";
import Greengrass from "./_component/list/Greengrass";
import Soybean from "./_component/list/Soybean";

export const revalidate = 0;

const GardenUI = () => {
    const [list, setList] = useState([]);
    const [tab, setTab] = useState("Greengrass");

    const fetchList = async () => {
        const response = await ky.get('/api/money/garden/list').json();
        setList(response.list);
    }

    useEffect(() => {
        fetchList();
    }, []);
    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
                    <Button variant="outline" asChild className="hidden">
                        <Link href={`/money/list`}>
                            返回
                        </Link>
                    </Button>
                    <ToggleGroup type="single" defaultValue="Greengrass" variant="outline"
                        onValueChange={(v) => {
                            if (v) setTab(v);
                        }}>
                        <ToggleGroupItem value="Soybean" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">春盛园</ToggleGroupItem>
                        <ToggleGroupItem value="Greengrass" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">百草园</ToggleGroupItem>
                    </ToggleGroup>

                </div>
            </div>
            {tab === "Soybean" && <Soybean list={list} />}
            {tab === "Greengrass" && <Greengrass list={list} onAddSuccess={fetchList} />}
        </>
    );
}
export default GardenUI;