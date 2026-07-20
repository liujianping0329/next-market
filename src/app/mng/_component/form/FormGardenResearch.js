"use client";


import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import ky from "ky";
import {
    ExternalLink
} from "lucide-react";
import Link from "next/link";
import {
    useEffect,
    useState
} from "react";

const FormGardenResearch = ({ trigger, openCtrl, setOpenCtrl, onSuccess, defaultValues = null }) => {

    const [open, setOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const fetchVideos = async () => {
            const response = await ky.post('/api/research/match', {
                json: {}
            }).json();
            setVideos(response.list);
        };

        fetchVideos();
    }, []);

    return (
        <>
            <Dialog open={openCtrl ?? open} onOpenChange={setOpenCtrl ?? setOpen}>
                {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>类目探索</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground">

                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />

                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">

                                        </div>
                                    </div>
                                </Link>

                                {/* 内容 */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="line-clamp-1 text-base font-semibold">
                                                {item.title || "未命名视频"}
                                            </h3>

                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-600">
                                                    抖音
                                                </span>

                                                <span className="truncate">
                                                    ID：{item.sourceId}
                                                </span>
                                            </div>
                                        </div>

                                        {/* <Link
                                            href={item.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label="打开视频"
                                            className="shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Link> */}
                                    </div>

                                    {/* 详情 */}
                                    <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                                        {item.detail || "暂无详细说明"}
                                    </p>

                                    {/* 查看链接 */}
                                    <Link
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700"
                                    >
                                        查看视频
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </DialogContent>

            </Dialog >
        </>
    );
}

export default FormGardenResearch;