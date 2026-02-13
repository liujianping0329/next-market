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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEffect, useMemo, useState } from "react";
import FormGarden from "./_component/form/FormGarden";
import { Spinner } from "@/components/ui/spinner"

export const revalidate = 0;

const GardenUI = () => {
    const [openGarden, setOpenGarden] =  useState(false);

    const [isLoadGarden, setIsLoadGarden] = useState(false);
    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
                    <Button variant="outline" asChild>
                        <Link href={`/money/list`}>
                            返回
                        </Link>
                    </Button>
                    <ToggleGroup type="single" defaultValue="plant" variant="outline">
                      <ToggleGroupItem value="daily" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">每日种草</ToggleGroupItem>
                      <ToggleGroupItem value="plant" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">种草</ToggleGroupItem>
                    </ToggleGroup>
                    
                    <Dialog open={openGarden} onOpenChange={setOpenGarden}>
                        <DialogTrigger asChild>
                            <Button variant="outline">新增</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>种草</DialogTitle>
                            </DialogHeader>
                            <FormGarden onSuccess={()=>{
                                setOpenGarden(false);
                                // fetchList();
                            }} btnStatus = {setIsLoadGarden}/>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formGarden" disabled = {isLoadGarden}>
                                    {isLoadGarden && <Spinner />}保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>            
        </>
    );
}
export default GardenUI;