"use client"

import { useEffect, useRef, useState } from "react"
import imageCompression from "browser-image-compression"
import ky from "ky"
import Image from "next/image"
import { ArrowUpToLine, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer"

const PicUploaderAdvance = ({ defaultPics = [], onChange }) => {
    const fileInputRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [pics, setPics] = useState(defaultPics)
    const [uploading, setUploading] = useState(false)
    const [deletingUrl, setDeletingUrl] = useState("")

    const updatePics = (updater) => {
        setPics((prev) => (typeof updater === "function" ? updater(prev) : updater))
    }

    useEffect(() => {
        onChange?.(pics)
    }, [pics, onChange])

    const handleSelectFiles = async (event) => {
        const selectedFiles = Array.from(event.target.files || [])
        event.currentTarget.value = ""

        if (!selectedFiles.length) return

        setUploading(true)

        try {
            const imgOptions = {
                maxSizeMB: 0.8,
                maxWidthOrHeight: 1200,
            }
            const fd = new FormData()

            for (const file of selectedFiles) {
                const compressed = await imageCompression(file, imgOptions)
                fd.append("files", compressed)
            }

            const uploadedUrls = await ky.post("/api/file", { body: fd }).json()
            updatePics((prev) => [...prev, ...uploadedUrls])
        } finally {
            setUploading(false)
        }
    }

    const moveItemToTop = (index) => {
        if (index <= 0) return

        updatePics((prev) => {
            const next = [...prev]
            const [current] = next.splice(index, 1)
            next.unshift(current)
            return next
        })
    }

    const removeItem = async (url) => {
        setDeletingUrl(url)

        try {
            await ky.delete("/api/file", { json: { urls: [url] } })
            updatePics((prev) => prev.filter((pic) => pic !== url))
        } finally {
            setDeletingUrl("")
        }
    }

    const isBusy = uploading || Boolean(deletingUrl)

    return (
        <>
            <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-100 px-3 py-2">
                <div className="flex-1 text-sm text-gray-600">
                    已上传 {pics.length} 张图片
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                    管理图片
                </Button>
            </div>

            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerContent className="h-[80dvh] flex flex-col px-4 pb-4">
                    <DrawerHeader className="pb-2">
                        <DrawerTitle>管理图片</DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-2">
                        <div className="mb-4 flex items-center justify-between rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-3">
                            <div className="text-sm text-gray-600">
                                已上传 {pics.length} 张图片
                            </div>
                            <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isBusy}>
                                {uploading ? "上传中..." : "选择图片"}
                            </Button>
                        </div>

                        <Input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleSelectFiles}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            {pics.length === 0 && (
                                <div className="col-span-2 rounded-md border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-muted-foreground">
                                    暂无图片
                                </div>
                            )}

                            {pics.map((pic, index) => (
                                <div key={`${pic}-${index}`} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-3">
                                    <div className="relative h-28 flex-1 overflow-hidden rounded-md bg-muted">
                                        <Image src={pic} alt={`image-${index + 1}`} fill className="object-cover" unoptimized />
                                    </div>

                                    <div className="flex h-28 flex-col justify-between">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() => moveItemToTop(index)}
                                            disabled={index === 0 || isBusy}
                                        >
                                            <ArrowUpToLine className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon-sm"
                                            onClick={() => removeItem(pic)}
                                            disabled={isBusy}
                                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DrawerFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isBusy}>
                            完成
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default PicUploaderAdvance
