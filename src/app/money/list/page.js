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
import { useEffect } from "react";
import ky from "ky";

const MoneyList = () => {
    // useEffect(async() => {
    //     const params = new URLSearchParams({
    //         from: 'CNY',
    //         to: 'JPY',
    //         version: 2,
    //         key: '4bd5698591ec2b8ad65e16994e783d39',
    //     });

    //     const { list } = await ky.get('http://op.juhe.cn/onebox/exchange/currency?${params.toString()}').json();
    //     console.log(list);
    // });
    return (
        <>
            <div id="toolBar" className="flex p-2.5 justify-between">
                <div className="flex space-x-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">（许）进帐</Button>
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
                                        <FieldLabel htmlFor="dateX">日期</FieldLabel>
                                        <Input id="dateX" type="text" placeholder="请输入日期" />
                                        </Field>
                                        <Field>
                                        <FieldLabel  htmlFor="jpyX">日币（万）</FieldLabel>
                                        <Input id="jpyX" type="text" placeholder="请输入金额" />
                                        </Field>
                                        <Field>
                                        <FieldLabel  htmlFor="twdX">台币</FieldLabel>
                                        <Input id="twdX" type="text" placeholder="请输入金额" />
                                        </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                <FieldSeparator />
                                    <FieldSet>
                                        <FieldLabel>投资</FieldLabel>
                                        <FieldGroup>
                                        <Field>
                                        <FieldLabel  htmlFor="nisaX">NISA（万jpy）</FieldLabel>
                                        <Input id="nisaX" type="text" placeholder="请输入金额" />
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
                                        <FieldLabel htmlFor="dateL">日期</FieldLabel>
                                        <Input id="dateL" type="text" placeholder="请输入日期" />
                                        </Field>
                                        <Field>
                                        <FieldLabel  htmlFor="jpyL">日币（万）</FieldLabel>
                                        <Input id="jpyL" type="text" placeholder="请输入金额" />
                                        </Field>
                                        <Field>
                                        <FieldLabel  htmlFor="zfb">支付宝</FieldLabel>
                                        <Input id="zfb" type="text" placeholder="请输入金额" />
                                        </Field>
                                        </FieldGroup>
                                    </FieldSet>
                                <FieldSeparator />
                                    <FieldSet>
                                        <FieldLabel>金库</FieldLabel>
                                        <FieldGroup>
                                        <Field>
                                        <FieldLabel  htmlFor="cnbj">中行日元（万）</FieldLabel>
                                        <Input id="cnbj" type="text" placeholder="请输入金额" />
                                        </Field>
                                        <Field>
                                        <FieldLabel  htmlFor="zsbc">招行人民币</FieldLabel>
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
                </div>
                <Button variant="outline">图表</Button>
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
                <TableRow>
                  <TableCell>🐕</TableCell>
                  <TableCell>🐕</TableCell>
                  <TableCell>🐕</TableCell>
                  <TableCell>🐕</TableCell>
                  <TableCell>🐕</TableCell>
                  <TableCell>🐕</TableCell>
                  <TableCell>🐕</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>🐱</TableCell>
                  <TableCell>🐱</TableCell>
                  <TableCell>🐱</TableCell>
                  <TableCell>🐱</TableCell>
                  <TableCell>🐱</TableCell>
                  <TableCell>🐱</TableCell>
                  <TableCell>🐱</TableCell>
                </TableRow>
      </TableBody>
            </Table>
            </div>

            
        </>
    )
}

export default MoneyList;