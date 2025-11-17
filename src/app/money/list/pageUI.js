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
import Datepicker from "./_component/datepicker";
import FormX from "./_component/form/formX";

export const revalidate = 0;

const MoneyListUI = ({ list, exchanges: { cnyToJpy, twdToJpy, usdToJpy } }) => {
    const [openX, setOpenX] =  useState(false);
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
                            }} exchanges = {{ cnyToJpy, twdToJpy, usdToJpy }}/>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit" form="formX">保存</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">（刘）进帐</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>记账本</DialogTitle>
                            </DialogHeader>
                            <div className="w-full">
                                <FieldGroup>
                                    <FieldSet>
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="date">日期</FieldLabel>
                                                <Datepicker dateDf={new Date()} />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="jpyL">日币（万）</FieldLabel>
                                                <Input id="jpyL" type="text" placeholder="请输入金额" />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="zfb">支付宝</FieldLabel>
                                                <Input id="zfb" type="text" placeholder="请输入金额" />
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                    <FieldSeparator />
                                    <FieldSet>
                                        <FieldLabel>金库</FieldLabel>
                                        <FieldGroup>
                                            <Field>
                                                <FieldLabel htmlFor="cnbj">中行日元（万）</FieldLabel>
                                                <Input id="cnbj" type="text" placeholder="请输入金额" />
                                            </Field>
                                            <Field>
                                                <FieldLabel htmlFor="zsbc">招行人民币</FieldLabel>
                                                <Input id="zsbc" type="text" placeholder="请输入金额" />
                                            </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                </FieldGroup>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">关闭</Button>
                                </DialogClose>
                                <Button type="submit">保存</Button>
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