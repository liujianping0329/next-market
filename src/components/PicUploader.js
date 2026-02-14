"use client"

import { forwardRef, useImperativeHandle, useState } from "react"
import imageCompression from "browser-image-compression";
import { Input } from "@/components/ui/input"
import ky from "ky"


const PicUploader = forwardRef(function PicUploader(props,ref) {

    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)

    const upload = async () => {
        setUploading(true)

        const ImgOptions = {
          maxSizeMB: 0.8,        // 最大 0.5MB
          maxWidthOrHeight: 1200 // 最长边 1200px
        };
        const fd = new FormData()

        const compressedFiles = [];
        for (const f of files) {
          compressedFiles.push(await imageCompression(f, ImgOptions));
        }

        compressedFiles.forEach(async (f) => fd.append("files", f))
        const res = await ky.post('/api/file', { body: fd }).json()
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

            {files.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  已选择 {files.length} 张 {uploading ? "（上传中）" : ""}
                </div>
            )}
        </>
    )
})

export default PicUploader;