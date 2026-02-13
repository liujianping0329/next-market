import { forwardRef, useImperativeHandle, useState } from "react"
import { Input } from "@/components/ui/input"
import ky from "ky"


const PicUploader = forwardRef(function PicUploader(props,ref) {

    const [files, setFiles] = useState([])
    const [uploading, setUploading] = useState(false)

    const upload = async () => {
        setUploading(true)

        const fd = new FormData()
        files.forEach((f) => fd.append("files", f))
        alert(`Uploading ${files.length} files`);
        // const res = await ky.post(uploadUrl, { body: fd }).json()
        setUploading(false)
        return ["123","456"];
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