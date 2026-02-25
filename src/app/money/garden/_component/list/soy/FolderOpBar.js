
import ActionButton from "@/components/ActionButton";
import { Check } from "lucide-react";
import { Info, Pencil, Trash2, Share2, ArrowLeft } from "lucide-react"
import ky from "ky";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fa } from "zod/v4/locales";

const FolderOpBar = ({ folder, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const deleteHandle = async (id) => {
    setIsDeleting(true);
    await ky.post('/api/money/garden/soy/delete', {
      json: { id }
    }).json();
    setIsDeleting(false);
    onSuccess();
  };

  const updateHandle = async (id) => {
    setIsUpdating(true);
    alert("修改功能待开发，敬请期待！");
    // await ky.post('/api/money/garden/soy/update', {
    //   json: { id }
    // }).json();
    setIsUpdating(false);
    onSuccess();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <ActionButton icon={Pencil} onClick={() => updateHandle(folder.id)} disabled={isUpdating} />
      <ActionButton icon={Trash2} onClick={() => deleteHandle(folder.id)} disabled={isDeleting} />
    </div>
  )
}

export default FolderOpBar;