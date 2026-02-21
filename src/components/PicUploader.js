"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import imageCompression from "browser-image-compression";
import { Input } from "@/components/ui/input"
import ky from "ky"


const PicUploader = forwardRef(function PicUploader({ defaultPics = [] }, ref) {

    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)

    const upload = async () => {
        setUploading(true)

        let res = defaultPics;
        if (files.length) {
            const ImgOptions = {
                maxSizeMB: 0.8,        // 最大 0.5MB
                maxWidthOrHeight: 1200 // 最长边 1200px
            };
            const fd = new FormData()

            for (const f of files) {
                const compressed = await imageCompression(f, ImgOptions);
                fd.append("files", compressed);
            }

            res = await ky.post('/api/file', { body: fd }).json()
        }

        setUploading(false)
        return res;
    }

    const clear = () => setFiles([])

    useImperativeHandle(ref, () => ({ upload, clear }))

    return (
        <>
            <Input type="file" accept="image/*" disabled={uploading} multiple
                onChange={(e) => {
                    setFiles(Array.from(e.target.files || []))
                    e.currentTarget.value = ""
                }} />

            <div className="text-xs text-muted-foreground">
                {files.length > 0 && (
                    <>
                        已选择 {files.length} 张 {uploading ? "（上传中）" : ""}
                    </>
                )}
                {files.length === 0 && defaultPics.length > 0 && (
                    <>
                        现有 {defaultPics.length} 张
                    </>
                )}
            </div>
        </>
    )
})

export default PicUploader;