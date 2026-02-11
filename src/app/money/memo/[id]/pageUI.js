"use client";
import { Button } from "@/components/ui/button"
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

export const revalidate = 0;

const MemoDetailUI = ({ basicData, memoList }) => {
    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center">
                <div className="flex space-x-2 items-center">
                    <Button variant="outline" asChild>
                        <Link href={`/money/list`}>
                            返回
                        </Link>
                    </Button>
                    total: {basicData.total} (profit: {basicData.profitText})
                </div>
            </div>
            <div className="p-2.5">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>日期</TableHead>
                            <TableHead>价格(万日元)</TableHead>
                            <TableHead>种类</TableHead>
                            <TableHead>备注</TableHead>
                            <TableHead>操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {memoList.map((row) => {
                             return (
                                <TableRow key={row.id}>
                                    <TableCell>{row.date}</TableCell>
                                    <TableCell>{row.price}</TableCell>
                                    <TableCell>{row.kind}</TableCell>
                                    <TableCell>{row.memo}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="outline">
                                                编辑
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
    );
}
export default MemoDetailUI;