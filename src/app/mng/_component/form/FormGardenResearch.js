"use client";


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import Link from "next/link";
import {
    useEffect,
    useState
} from "react";
import {
    CircleCheckBig,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserStore } from "@/app/money/garden/_store/userStore";

const FormGardenResearch = ({ trigger, openCtrl, setOpenCtrl, onSuccess, defaultValues = null }) => {

    const [open, setOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);
    const [isApiLoad, setIsApiLoad] = useState(false);
    const [videos, setVideos] = useState([]);
    const [keyword, setKeyword] = useState("");
    const userInfoStore = useUserStore(state => state.userInfo);

    const fetchVideos = async () => {
        setIsLoad(true);
        const response = await ky.post('/api/research/match', {
            json: { cateId: defaultValues.id, }
        }).json();
        setVideos(response.list);
        setIsLoad(false);
    };

    useEffect(() => {
        fetchVideos();
    }, []);
    const channelMap = {
        douyin: "抖音",
        xiaohongshu: "小红书",
        bilibili: "哔哩哔哩",
    };

    return (
        <>
            <Dialog open={openCtrl ?? open} onOpenChange={setOpenCtrl ?? setOpen}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>类目探索</DialogTitle>
                    </DialogHeader>
                    {isLoad ? (
                        <div className="flex min-h-52 items-center justify-center">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Spinner />
                                <span>正在加载...</span>
                            </div>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                            暂无数据
                        </div>
                    ) :
                        (<>
                            <div className="flex gap-2 items-center">
                                <Input className="flex-1 h-7" value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)} />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        disabled={isApiLoad || !keyword.trim()}
                                        onClick={async () => {
                                            setIsApiLoad(true);
                                            await ky.post('/api/research/douyin/getOne', {
                                                json: {
                                                    cateId: defaultValues.id,
                                                    keyword
                                                }
                                            }).json();
                                            setIsApiLoad(false);
                                            fetchVideos();
                                        }}
                                    >
                                        oneApi
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        disabled={isApiLoad || !keyword.trim()}
                                        onClick={async () => {
                                            setIsApiLoad(true);
                                            await ky.post('/api/research/douyin/rapid', {
                                                json: {
                                                    cateId: defaultValues.id,
                                                    keyword
                                                }
                                            }).json();
                                            setIsApiLoad(false);
                                            fetchVideos();
                                        }}
                                    >
                                        rapidApi
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto mt-[-8px]">
                                {videos.map((item) => (
                                    <article
                                        key={item.id}
                                        className="overflow-hidden rounded-2xl border bg-background shadow-sm"
                                    >
                                        {/* 封面 */}
                                        <Link
                                            key={item.id}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative block aspect-[16/10] overflow-hidden bg-muted"
                                        >
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                                />
                                            )}
                                        </Link>

                                        {/* 内容 */}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="line-clamp-1 text-base font-semibold">
                                                        {item.title || "未命名视频"}
                                                    </h3>

                                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                                        <span className="rounded-md bg-rose-50 text-rose-500">
                                                            {channelMap[item.channel] || item.channel}
                                                        </span>
                                                        {item?.hashtags?.map((tag, index) => (
                                                            <span key={`${tag}-${index}`} className="rounded bg-sky-50 text-sky-600">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 详情 */}
                                            <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                                {item.detail || "暂无详细说明"}
                                            </p>

                                            {/* 操作区 */}
                                            <div className="mt-3 flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 text-xs"
                                                    onClick={async () => {
                                                        try {
                                                            await ky.post("/api/research/delete", {
                                                                json: {
                                                                    id: item.id
                                                                },
                                                            });
                                                            toast.success("已删除");
                                                            fetchVideos();
                                                        } catch (error) {
                                                            console.error(error);
                                                            toast.error("删除失败");
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    删除
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 text-xs"
                                                    disabled={item.garden?.length > 0}
                                                    onClick={async () => {
                                                        try {
                                                            await ky.post("/api/research/saveGarden", {
                                                                json: {
                                                                    userId: userInfoStore.id,
                                                                    cateId: defaultValues.id,
                                                                    ...(item),
                                                                },
                                                            });
                                                            setVideos((prev) =>
                                                                prev.map((video) =>
                                                                    video.id === item.id
                                                                        ? {
                                                                            ...video,
                                                                            garden: [-1],
                                                                        }
                                                                        : video
                                                                )
                                                            );
                                                            toast.success("已保存到夏园");
                                                        } catch (error) {
                                                            console.error(error);
                                                            toast.error("保存失败");
                                                        }
                                                    }}
                                                >
                                                    <CircleCheckBig className="h-4 w-4" />
                                                    {item.garden?.length > 0 ? "已收藏" : "收藏到夏园"}
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </>)}
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormGardenResearch;