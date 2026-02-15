"use client";
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEffect, useMemo, useState } from "react";
import FormGarden from "./_component/form/FormGarden";
import { Spinner } from "@/components/ui/spinner";
import Soybean from "./_component/list/Soybean";
import Greengrass from "./_component/list/Greengrass";
import ky from "ky";

export const revalidate = 0;

const GardenUI = () => {
    const [openGarden, setOpenGarden] = useState(false);
    const [list, setList] = useState([]);
    const [tab, setTab] = useState("Greengrass");

    const [isLoadGarden, setIsLoadGarden] = useState(false);

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

                    <Dialog open={openGarden} onOpenChange={setOpenGarden}>
                        <DialogTrigger asChild>
                            <Button variant="outline">新增</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>种草</DialogTitle>
                            </DialogHeader>
                            <FormGarden onSuccess={() => {
                                setOpenGarden(false);
                                fetchList();
                            }} btnStatus={setIsLoadGarden} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formGarden" disabled={isLoadGarden}>
                                    {isLoadGarden && <Spinner />}保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            {tab === "Soybean" && <Soybean list={list} />}
            {tab === "Greengrass" && <Greengrass list={list} />}
        </>
    );
}
export default GardenUI;