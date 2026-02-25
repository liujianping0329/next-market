
import ActionButton from "@/components/ActionButton";
import { Check } from "lucide-react";
import { Info, Pencil, Trash2, Share2, ArrowLeft } from "lucide-react"

const FolderOpBar = ({ }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      <ActionButton icon={Pencil} />
      <ActionButton icon={Trash2} />
    </div>
  )
}

export default FolderOpBar;