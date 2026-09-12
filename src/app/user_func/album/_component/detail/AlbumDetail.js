"use client";

import ky from "ky";
import { DownloadOne, LoadingFour, Magic, PreviewClose, PreviewOpen } from "@icon-park/react";
import { ArrowLeft, Check, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value)));

const normalizeAlternativeNames = (value) => {
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
};

const AlbumDetail = ({ id, backHref, onBack, enableAlbumActions = false }) => {
    const imageRef = useRef(null);
    const [detail, setDetail] = useState(null);
    const [error, setError] = useState("");
    const [imageAspectRatio, setImageAspectRatio] = useState(4 / 3);
    const [showMarkers, setShowMarkers] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [savingItemId, setSavingItemId] = useState(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [newItemAmount, setNewItemAmount] = useState("");
    const [isSavingNewItem, setIsSavingNewItem] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState(null);

    useEffect(() => {
        let active = true;

        ky.post("/api/album/detail", { json: { id } })
            .json()
            .then((response) => {
                if (active) {
                    setImageAspectRatio(4 / 3);
                    setShowMarkers(false);
                    setAnalysisSubmitted(false);
                    setDetail(response.detail);
                }
            })
            .catch(async (requestError) => {
                if (!active) return;

                let message = "相册详情加载失败";
                if (requestError.response) {
                    try {
                        const body = await requestError.response.clone().json();
                        message = body?.message || message;
                    } catch {
                        // Keep the user-facing fallback message.
                    }
                }
                setError(message);
            });

        return () => {
            active = false;
        };
    }, [id]);

    const handleDownload = async () => {
        if (!detail?.pic || isDownloading) return;

        setIsDownloading(true);

        try {
            const imageUrl = imageRef.current?.currentSrc || detail.pic;
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error("图片下载失败");

            const blob = await response.blob();
            const imageType = blob.type || "image/jpeg";
            const extension = imageType === "image/jpeg"
                ? "jpg"
                : imageType.split("/")[1]?.split("+")[0] || "jpg";
            const safeTitle = (detail.title || `album-${id}`)
                .replace(/[\\/:*?"<>|]/g, "-")
                .trim();
            const fileName = `${safeTitle || `album-${id}`}.${extension}`;
            const file = new File([blob], fileName, { type: imageType });

            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: detail.title || "相册图片",
                });
                return;
            }

            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (downloadError) {
            if (downloadError?.name !== "AbortError") {
                console.error("下载相册图片失败", downloadError);
                window.alert("图片下载失败，请长按图片保存");
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const handleAnalyze = async () => {
        if (isAnalyzing || analysisSubmitted) return;

        setIsAnalyzing(true);

        try {
            await ky.post("/api/album/analyze", {
                json: { id },
                timeout: 30_000,
            });
            setAnalysisSubmitted(true);
            toast.info("已重新提交 AI 分析，本次不会发送推送");
        } catch (analyzeError) {
            let message = "AI 分析提交失败";

            if (analyzeError.response) {
                try {
                    const body = await analyzeError.response.clone().json();
                    message = body?.message || message;
                } catch {
                    // Keep the user-facing fallback message.
                }
            }

            toast.error(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const startEditingItem = (item) => {
        setEditingItemId(item.id);
        setEditingName(item.name || "");
    };

    const cancelEditingItem = () => {
        setEditingItemId(null);
        setEditingName("");
    };

    const saveItemName = async (item) => {
        const name = editingName.trim();

        if (!name || savingItemId != null) {
            if (!name) toast.error("请输入成分名称");
            return;
        }

        setSavingItemId(item.id);

        try {
            const response = await ky.patch("/api/album/item", {
                json: {
                    albumId: id,
                    itemId: item.id,
                    name,
                },
            }).json();
            const updatedItem = response.item;

            setDetail((currentDetail) => ({
                ...currentDetail,
                albumItems: (currentDetail.albumItems ?? []).map((currentItem) => (
                    currentItem.id === updatedItem.id
                        ? { ...currentItem, ...updatedItem }
                        : currentItem
                )),
            }));
            cancelEditingItem();
            toast.success("成分名称已确认");
        } catch (saveError) {
            let message = "成分名称修改失败";

            if (saveError.response) {
                try {
                    const body = await saveError.response.clone().json();
                    message = body?.message || message;
                } catch {
                    // Keep the user-facing fallback message.
                }
            }

            toast.error(message);
        } finally {
            setSavingItemId(null);
        }
    };

    const cancelAddingItem = () => {
        setIsAddingItem(false);
        setNewItemName("");
        setNewItemAmount("");
    };

    const saveNewItem = async () => {
        const name = newItemName.trim();
        const estimatedAmount = newItemAmount.trim();

        if (!name || !estimatedAmount || isSavingNewItem) {
            if (!name || !estimatedAmount) toast.error("请输入名称和分量");
            return;
        }

        setIsSavingNewItem(true);

        try {
            const response = await ky.post("/api/album/item", {
                json: {
                    albumId: id,
                    name,
                    estimatedAmount,
                },
            }).json();

            setDetail((currentDetail) => ({
                ...currentDetail,
                albumItems: [
                    ...(currentDetail.albumItems ?? []),
                    response.item,
                ],
            }));
            cancelAddingItem();
            toast.success("成分已新增");
        } catch (saveError) {
            let message = "新增成分失败";

            if (saveError.response) {
                try {
                    const body = await saveError.response.clone().json();
                    message = body?.message || message;
                } catch {
                    // Keep the user-facing fallback message.
                }
            }

            toast.error(message);
        } finally {
            setIsSavingNewItem(false);
        }
    };

    const deleteItem = async (item) => {
        if (deletingItemId != null) return;
        if (!window.confirm(`确定删除“${item.name}”吗？`)) return;

        setDeletingItemId(item.id);

        try {
            await ky.delete("/api/album/item", {
                json: {
                    albumId: id,
                    itemId: item.id,
                },
            });

            setDetail((currentDetail) => ({
                ...currentDetail,
                albumItems: (currentDetail.albumItems ?? []).filter(
                    (currentItem) => currentItem.id !== item.id,
                ),
            }));

            if (editingItemId === item.id) cancelEditingItem();
            toast.success("成分已删除");
        } catch (deleteError) {
            let message = "删除成分失败";

            if (deleteError.response) {
                try {
                    const body = await deleteError.response.clone().json();
                    message = body?.message || message;
                } catch {
                    // Keep the user-facing fallback message.
                }
            }

            toast.error(message);
        } finally {
            setDeletingItemId(null);
        }
    };

    if (error) {
        return (
            <main className="flex min-h-[100dvh] items-center justify-center px-6 text-sm text-muted-foreground">
                {error}
            </main>
        );
    }

    if (!detail) {
        return (
            <main className="min-h-[100dvh] bg-background">
                <div className="aspect-[4/3] w-full animate-pulse bg-stone-200" />
                <div className="space-y-3 px-5 py-6">
                    <div className="h-8 w-1/2 animate-pulse rounded bg-stone-200" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-stone-100" />
                </div>
            </main>
        );
    }

    const albumItems = detail.albumItems ?? [];
    const markedItems = albumItems
        .filter((item) => item.center_x_percent != null && item.center_y_percent != null)
        .slice(0, 4);
    const createdAt = detail.created_at
        ? new Date(detail.created_at).toLocaleString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

    return (
        <article className="min-h-[100dvh] w-full bg-[#fffefa] text-[#40352c]">
            <div
                className="relative w-full overflow-hidden bg-stone-200"
                style={{ aspectRatio: imageAspectRatio }}
            >
                <Image
                    ref={imageRef}
                    src={detail.pic}
                    alt={detail.title || "相册图片"}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                    onLoad={(event) => {
                        const { naturalWidth, naturalHeight } = event.currentTarget;
                        if (naturalWidth && naturalHeight) {
                            setImageAspectRatio(naturalWidth / naturalHeight);
                        }
                    }}
                />

                {showMarkers && (
                    <>
                        <div className="pointer-events-none absolute inset-0 bg-black/25" />
                        {markedItems.map((item) => (
                            <div
                                key={item.id}
                                className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                                style={{
                                    left: `${clampPercent(item.center_x_percent)}%`,
                                    top: `${clampPercent(item.center_y_percent)}%`,
                                }}
                            >
                                <div className="flex flex-col items-center drop-shadow-lg">
                                    <span className="whitespace-nowrap rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                        {item.name}
                                    </span>
                                    <span className="mt-1 size-3 rounded-full border-2 border-white bg-amber-400 shadow" />
                                </div>
                            </div>
                        ))}
                    </>
                )}

                <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                    {enableAlbumActions && albumItems.length === 0 && (
                        <button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || analysisSubmitted}
                            aria-label={analysisSubmitted ? "AI 分析已提交" : "重新提交 AI 分析"}
                            title={analysisSubmitted ? "AI 分析已提交" : "重新提交 AI 分析"}
                            className="grid size-10 place-items-center rounded-full bg-amber-500/90 text-white shadow-sm backdrop-blur-md transition hover:bg-amber-500 disabled:cursor-wait disabled:opacity-65"
                        >
                            {isAnalyzing ? (
                                <LoadingFour className="animate-spin" size={20} />
                            ) : (
                                <Magic size={20} />
                            )}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowMarkers((visible) => !visible)}
                        aria-label={showMarkers ? "隐藏图片标记" : "显示图片标记"}
                        aria-pressed={showMarkers}
                        title={showMarkers ? "隐藏图片标记" : "显示图片标记"}
                        className="grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                    >
                        {showMarkers ? <PreviewClose size={20} /> : <PreviewOpen size={20} />}
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isDownloading}
                        aria-label="下载图片"
                        title="下载图片"
                        className="grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60 disabled:cursor-wait disabled:opacity-60"
                    >
                        <DownloadOne size={20} />
                    </button>
                </div>

                {onBack ? (
                    <button
                        type="button"
                        onClick={onBack}
                        aria-label="返回相册"
                        className="absolute left-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                ) : (
                    <Link
                        href={backHref || "/user_func/album"}
                        aria-label="返回相册"
                        className="absolute left-4 top-4 z-20 grid size-10 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-black/60"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                )}

                <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-5 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        {detail.title || "相册记录"}
                    </h1>
                    {detail.detail && (
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-white/85">
                            {detail.detail}
                        </p>
                    )}
                </div>
            </div>

            <main className="px-5 pb-14 pt-5">
                {createdAt && (
                    <p className="text-xs text-muted-foreground">{createdAt}</p>
                )}

                <section className="mt-7">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-amber-600" />
                            <h2 className="text-base font-semibold">图片组成</h2>
                            <span className="text-xs text-muted-foreground">{albumItems.length} 项</span>
                        </div>
                        {enableAlbumActions && !isAddingItem && (
                            <button
                                type="button"
                                onClick={() => setIsAddingItem(true)}
                                aria-label="新增成分"
                                title="新增成分"
                                className="grid size-8 place-items-center rounded-full text-amber-700 transition hover:bg-amber-50"
                            >
                                <Plus className="size-5" />
                            </button>
                        )}
                    </div>

                    {enableAlbumActions && isAddingItem && (
                        <div className="mt-3 border-y border-amber-200 bg-amber-50/45 px-1 py-3">
                            <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(event) => setNewItemName(event.target.value)}
                                    placeholder="成分名称"
                                    autoFocus
                                    maxLength={100}
                                    className="h-9 min-w-0 rounded-lg border border-amber-300 bg-white px-3 text-sm text-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                                />
                                <input
                                    type="text"
                                    value={newItemAmount}
                                    onChange={(event) => setNewItemAmount(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") saveNewItem();
                                        if (event.key === "Escape") cancelAddingItem();
                                    }}
                                    placeholder="分量，如约1碗"
                                    maxLength={100}
                                    className="h-9 min-w-0 rounded-lg border border-amber-300 bg-white px-3 text-sm text-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                                />
                            </div>
                            <div className="mt-2 flex justify-end gap-1">
                                <button
                                    type="button"
                                    onClick={saveNewItem}
                                    disabled={isSavingNewItem}
                                    aria-label="确认新增"
                                    title="确认"
                                    className="grid size-8 place-items-center rounded-full text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                >
                                    <Check className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelAddingItem}
                                    disabled={isSavingNewItem}
                                    aria-label="放弃新增"
                                    title="放弃"
                                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-black/5 disabled:opacity-50"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {albumItems.length ? (
                        <div className="mt-3 divide-y divide-black/8 border-y border-black/8">
                            {albumItems.map((item) => {
                                const alternativeNames = normalizeAlternativeNames(item.alternative_names);

                                return (
                                    <div key={item.id} className="flex items-start gap-4 py-4">
                                        <div className="min-w-0 flex-1">
                                            {editingItemId === item.id ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(event) => setEditingName(event.target.value)}
                                                        onKeyDown={(event) => {
                                                            if (event.key === "Enter") {
                                                                event.preventDefault();
                                                                saveItemName(item);
                                                            }
                                                            if (event.key === "Escape") {
                                                                cancelEditingItem();
                                                            }
                                                        }}
                                                        autoFocus
                                                        maxLength={100}
                                                        className="h-9 w-full rounded-lg border border-amber-300 bg-white px-3 text-sm text-foreground outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                                                    />
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {alternativeNames.map((alternativeName) => (
                                                            <button
                                                                key={alternativeName}
                                                                type="button"
                                                                onClick={() => setEditingName(alternativeName)}
                                                                className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800 transition hover:bg-amber-100"
                                                            >
                                                                {alternativeName}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="font-medium text-foreground">{item.name}</p>
                                            )}
                                            {editingItemId !== item.id && alternativeNames.length > 0 && (
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    也可能是：{alternativeNames.join("、")}
                                                </p>
                                            )}
                                        </div>
                                        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                                            {item.estimated_amount || "份量不明"}
                                        </span>
                                        {enableAlbumActions && editingItemId === item.id ? (
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => saveItemName(item)}
                                                    disabled={savingItemId === item.id}
                                                    aria-label="确认成分名称"
                                                    title="确认"
                                                    className="grid size-8 place-items-center rounded-full text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                                >
                                                    <Check className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelEditingItem}
                                                    disabled={savingItemId === item.id}
                                                    aria-label="放弃修改"
                                                    title="放弃"
                                                    className="grid size-8 place-items-center rounded-full text-muted-foreground transition hover:bg-black/5 disabled:opacity-50"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        ) : enableAlbumActions && alternativeNames.length > 0 ? (
                                            <button
                                                type="button"
                                                onClick={() => startEditingItem(item)}
                                                aria-label={`修改${item.name}`}
                                                title="修改"
                                                className="grid size-8 shrink-0 place-items-center rounded-full text-amber-700 transition hover:bg-amber-50"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                        ) : null}
                                        {enableAlbumActions && editingItemId !== item.id && (
                                            <button
                                                type="button"
                                                onClick={() => deleteItem(item)}
                                                disabled={deletingItemId === item.id}
                                                aria-label={`删除${item.name}`}
                                                title="删除"
                                                className="grid size-8 shrink-0 place-items-center rounded-full text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mt-3 border-y border-black/8 py-6 text-sm text-muted-foreground">
                            暂无组成分析结果
                        </p>
                    )}
                </section>
            </main>
        </article>
    );
};

export default AlbumDetail;
