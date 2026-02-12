import { Input } from "@/components/ui/input"

const PicUploader = ({ rhfField }) => {
    const { value, ...rhfFieldRest } = rhfField

    return (
        <>
            <Input type="file" {...rhfFieldRest}  multiple />
        </>
    )
}
export default PicUploader;