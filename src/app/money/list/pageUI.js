"use client";
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldSeparator
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react";
import ky from "ky";
import FormX from "./_component/form/formX";
import FormL from "./_component/form/formL";
import { Spinner } from "@/components/ui/spinner"

export const revalidate = 0;

const MoneyListUI = ({ exchanges: { cnyToJpy, twdToJpy, usdToJpy } }) => {
    const [openX, setOpenX] =  useState(false);
    const [openL, setOpenL] =  useState(false);
    const [list, setList] = useState([]);
    const [isLoadX, setIsLoadX] = useState(false);
    const [isLoadL, setIsLoadL] = useState(false);

    const fetchList = async () => {
        const response = await ky.get('/api/money/list').json();
        setList(response.list);
    }

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
                    <Dialog open={openX} onOpenChange={setOpenX}>
                        <DialogTrigger asChild>
                            <Button variant="outline">（许）进帐</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>记账本</DialogTitle>
                            </DialogHeader>
                            <FormX onSuccess={()=>{
                                setOpenX(false);
                                fetchList();
                            }} exchanges = {{ cnyToJpy, twdToJpy, usdToJpy }} btnStatus = {setIsLoadX}/>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formX" disabled = {isLoadX}>
                                    {isLoadX && <Spinner />}保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={openL} onOpenChange={setOpenL}>
                        <DialogTrigger asChild>
                            <Button variant="outline">（刘）进帐</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>记账本</DialogTitle>
                            </DialogHeader>
                            <FormL onSuccess={()=>{
                                setOpenL(false);
                                fetchList();
                            }} exchanges = {{ cnyToJpy, twdToJpy, usdToJpy }} btnStatus = {setIsLoadL}/>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formL" disabled = {isLoadL}>
                                    {isLoadL && <Spinner />}保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <span className="text-[10px] whitespace-nowrap">美元:{usdToJpy};<br />人民币:{cnyToJpy};<br />台币:{twdToJpy}</span>
                </div>
                <Button className="" variant="outline">图表</Button>
            </div>
            <div className="p-2.5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>汇率(美金)</TableHead>
                            <TableHead>汇率(人民币)</TableHead>
                            <TableHead>汇率(台币)</TableHead>
                            <TableHead>总和(万日元)</TableHead>
                            <TableHead>盈亏</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell>{row.date}</TableCell>
                                <TableCell>{row.usdToJpy}</TableCell>
                                <TableCell>{row.cnyToJpy}</TableCell>
                                <TableCell>{row.twdToJpy}</TableCell>

                                {/* total 显示两位小数 */}
                                <TableCell>{Number(row.total).toFixed(2)}</TableCell>

                                {/* 盈亏先留空 */}
                                <TableCell>—</TableCell>

                                <TableCell>
                                    <Button size="sm" variant="outline">
                                        编辑
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>


        </>
    )
}

export default MoneyListUI;