import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
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
import { useEffect, useState } from "react";
import FormSoy from "../form/FormSoy";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";


const Soybean = () => {
    const [list, setList] = useState([]);
    const [pending, setPending] = useState(new Set()); // 正在同步的 id 集合

    const [openSoy, setOpenSoy] = useState(false);
    const [isLoadSoy, setIsLoadSoy] = useState(false);

    const fetchList = async () => {
        const response = await ky.post('/api/money/garden/list/match', {
            json: { topic: "SoyBean" }
        }).json();
        setList(response.list);
    }

    useEffect(() => {
        fetchList();
    }, []);

    const toggleOptimistic = async (item) => {
        const id = item.id;
        const nextStatus = item.status === "0" ? "1" : "0";

        // 1) 立刻更新 UI（乐观更新）
        setList(prev =>
            prev.map(x =>
                x.id === id ? { ...x, status: nextStatus } : x
            )
        );

        // 标记正在同步（可用于禁用重复点击或显示小 loading）
        setPending(prev => new Set(prev).add(id));


        // 2) 后台同步 DB
        await ky.post("/api/money/garden/upsert", {
            json: { id, status: nextStatus },
        }).json();
        setPending(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });

        // 3) 悄悄刷新（可选）
        //    如果你担心 DB 里还有别的字段会变（updated_at 等），就刷一下
        fetchList();
    };

    return (
        <>
            <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        即时的种草记录，包含要买的东西、要去做的事情等，记录灵感和想法，方便以后回顾和实践。
                    </span>

                    <div className="self-start">
                        <Dialog open={openSoy} onOpenChange={setOpenSoy}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">新增记录</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>新增</DialogTitle>
                                </DialogHeader>
                                <FormSoy onSuccess={() => {
                                    setOpenSoy(false);
                                    fetchList();
                                }} btnStatus={setIsLoadSoy} />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">关闭</Button>
                                    </DialogClose>
                                    <Button type="submit" form="formSoy" disabled={isLoadSoy}>
                                        {isLoadSoy && <Spinner />}保存
                                    </Button>
                                </DialogFooter>
                            </DialogContent>

                        </Dialog>
                    </div>
                </div>
            </div>
            <div id="cardContainer" className="p-4">
                {list.map((item, index) => {
                    const done = item.status === "0";
                    const syncing = pending.has(item.id);

                    return (
                        <Card key={item.id}
                            onClick={() => !syncing && toggleOptimistic(item)}
                            className={`mx-auto w-full max-w-sm cursor-pointer select-none transition
                                ${syncing ? "opacity-70" : ""}`}
                        >
                            <CardHeader className="flex items-center gap-3 rounded-lg border p-4">

                                {/* 圆圈 */}
                                <div
                                    className={`h-5 w-5 flex items-center justify-center rounded-full border transition
                                        ${done ? "bg-gray-400 border-gray-400" : "border-gray-400"}`}
                                >
                                    {done && <Check className="h-3 w-3 text-white" />}
                                </div>

                                {/* 标题 */}
                                <CardTitle
                                    className={`font-medium transition ${done ? "text-gray-400 line-through" : ""
                                        }`}
                                >
                                    {item.title}
                                </CardTitle>

                            </CardHeader>
                        </Card>
                    )
                })}
            </div>
        </>
    )
}

export default Soybean;