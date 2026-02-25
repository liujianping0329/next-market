import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import FormSoy from "../form/FormSoy";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";
import FolderOpBar from "./soy/FolderOpBar";

const Soybean = () => {
    const [list, setList] = useState([]);
    const [pending, setPending] = useState(new Set()); // 正在同步的 id 集合

    const [isLoadCleanup, setIsLoadCleanup] = useState(false);

    const [editVer, setEditVer] = useState(0);

    const fetchList = async () => {
        const response = await ky.post('/api/money/garden/list/match', {
            json: { topic: "SoyBean" }
        }).json();
        let dbList = response.list;
        let list = [{
            id: 0,
            category: "folder",
            title: "未分类",
            children: dbList.filter(item => !item.category).sort((a, b) => a.sort - b.sort)
        }]
        dbList.filter(item => item.category === "folder").sort((a, b) => a.sort - b.sort)
            .forEach(item => {
                list.push({
                    ...item,
                    children: dbList.filter(i => i.category === "item" && i.parent === item.id).sort((a, b) => a.sort - b.sort)
                });
            });
        setList(list);
        setEditVer(prev => prev + 1);
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

                    <div className="flex items-center justify-between">
                        <FormSoy trigger={
                            <Button size="sm" variant="outline">新增便签</Button>
                        } onSuccess={() => {
                            fetchList();
                        }} />

                        <Button size="sm" variant="outline" disabled={isLoadCleanup} onClick={() => {
                            setIsLoadCleanup(true);
                            ky.post("/api/money/garden/delete", {
                                json: { topic: "SoyBean", status: "0" }
                            }).then(() => {
                                fetchList();
                                setIsLoadCleanup(false);
                            });
                        }}>{isLoadCleanup && <Spinner />}一键清理</Button>
                    </div>
                </div>
            </div>
            <div id="cardContainer" className="p-4">
                {list.map(folder => {
                    const bg = pickColor(folder.id, "morandi");
                    return (
                        <div key={folder.id} className={`w-full pb-4 mb-4 rounded-2xl border ${bg}`}>
                            <div className="px-4 py-4 flex items-center justify-between">
                                <span>{folder.title}</span>
                                {folder.id !== 0 && <FolderOpBar folder={folder} onSuccess={fetchList} editVer={editVer} />}
                            </div>
                            {folder.children?.map((item, index) => {
                                const done = item.status === "0";
                                const syncing = pending.has(item.id);
                                let icon;
                                if (syncing) {
                                    icon = (
                                        <div className="h-5 w-5 flex items-center justify-center rounded-full border border-gray-400">
                                            <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                                        </div>
                                    );
                                } else if (done) {
                                    icon = (
                                        <div className="h-5 w-5 flex items-center justify-center rounded-full bg-gray-400 border-gray-400">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    );
                                } else {
                                    icon = (
                                        <div className="h-5 w-5 rounded-full border border-gray-400" />
                                    );
                                }
                                return (
                                    <div key={item.id} onClick={() => !syncing && toggleOptimistic(item)}
                                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition">
                                        {icon}
                                        <span className={`text-sm transition ${done ? "text-gray-400 line-through" : ""}`}>
                                            {item.title}
                                        </span>
                                    </div>)
                            })}
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default Soybean;