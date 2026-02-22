"use client";
import { Button } from "@/components/ui/button"
import Link from "next/link";
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
import { useEffect, useMemo, useState } from "react";
import ky from "ky";
import FormX from "./_component/form/formX";
import Bar, { toBarChartData } from "./_component/chart/bar";
import FormL from "./_component/form/formL";
import { Spinner } from "@/components/ui/spinner"
import FormMemo from "./_component/form/formMemo";
import { formatDateLocal } from "@/app/utils/date";

export const revalidate = 0;

const MoneyListUI = ({ exchanges: { cnyToJpy, twdToJpy, usdToJpy } }) => {
    const [openX, setOpenX] = useState(false);
    const [openL, setOpenL] = useState(false);
    const [openMemo, setOpenMemo] = useState(false);

    const [openChart, setOpenChart] = useState(false);
    const [list, setList] = useState([]);
    const [isLoadX, setIsLoadX] = useState(false);
    const [isLoadL, setIsLoadL] = useState(false);
    const [isLoadMemo, setIsLoadMemo] = useState(false);

    const chartData = useMemo(() => toBarChartData(list), [list]);

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
                            <FormX onSuccess={() => {
                                setOpenX(false);
                                fetchList();
                            }} exchanges={{ cnyToJpy, twdToJpy, usdToJpy }} btnStatus={setIsLoadX} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formX" disabled={isLoadX}>
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
                            <FormL onSuccess={() => {
                                setOpenL(false);
                                fetchList();
                            }} exchanges={{ cnyToJpy, twdToJpy, usdToJpy }} btnStatus={setIsLoadL} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formL" disabled={isLoadL}>
                                    {isLoadL && <Spinner />}保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={openMemo} onOpenChange={setOpenMemo}>
                        <DialogTrigger asChild>
                            <Button variant="outline">记一笔</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>记一笔支出/收入</DialogTitle>
                            </DialogHeader>
                            <FormMemo onSuccess={() => {
                                setOpenMemo(false);
                                fetchList();
                            }} btnStatus={setIsLoadMemo} />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formMemo" disabled={isLoadMemo}>
                                    {isLoadMemo && <Spinner />}保存
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button variant="outline" asChild
                        className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100">
                        <Link href={`/money/garden/`}>
                            青青草原
                        </Link>
                    </Button>
                </div>
                <Dialog open={openChart} onOpenChange={setOpenChart}>
                    <DialogTrigger asChild>
                        <Button className="" variant="outline">图表</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>图表</DialogTitle>
                        </DialogHeader>
                        <Bar data={chartData} />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">关闭</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
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
                        <TableRow className="bg-red-50 font-semibold border-l-4 border-red-400">
                            <TableCell>（现在）{formatDateLocal(new Date())}</TableCell>
                            <TableCell>{usdToJpy}</TableCell>
                            <TableCell>{cnyToJpy}</TableCell>
                            <TableCell>{twdToJpy}</TableCell>
                            {/* total 显示两位小数 */}
                            <TableCell>—</TableCell>
                            {/* 盈亏先留空 */}
                            <TableCell>—</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" asChild>
                                        <Link href={`/money/memo/-1`}>
                                            详情
                                        </Link>
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        {list.map((row, index) => {
                            const next = list[index + 1];
                            const profit =
                                next ? Number(row.total) - Number(next.total) : null;
                            const isPositive = profit !== null && profit > 0;
                            const isNegative = profit !== null && profit < 0;

                            return (
                                <TableRow key={row.id}>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.usdToJpy}</TableCell>
                                    <TableCell>{row.cnyToJpy}</TableCell>
                                    <TableCell>{row.twdToJpy}</TableCell>

                                    {/* total 显示两位小数 */}
                                    <TableCell>{Number(row.total).toFixed(2)}</TableCell>

                                    {/* 盈亏先留空 */}
                                    <TableCell className="flex items-center gap-1">
                                        {profit === null ? (
                                            "—"
                                        ) : (
                                            <>
                                                <span
                                                    className={
                                                        isPositive
                                                            ? "text-red-600"
                                                            : isNegative
                                                                ? "text-green-600"
                                                                : ""
                                                    }
                                                >
                                                    {isPositive && "▲"}
                                                    {isNegative && "▼"}
                                                    {profit >= 0
                                                        ? `+${profit.toFixed(2)}`
                                                        : profit.toFixed(2)}
                                                </span>
                                            </>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline">
                                                编辑
                                            </Button>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/money/memo/${row.id}`}>
                                                    详情
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>


        </>
    )
}

export default MoneyListUI;