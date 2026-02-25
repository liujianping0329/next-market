
import ActionButton from "@/components/ActionButton";
import { Check } from "lucide-react";
import { Info, Pencil, Trash2, Share2, ArrowLeft } from "lucide-react"
import ky from "ky";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fa } from "zod/v4/locales";
import FormSoy from "../../form/FormSoy";

const FolderOpBar = ({ folder, onSuccess, editVer }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteHandle = async (id) => {
    const ok = window.confirm("确定要删除吗？删除后无法恢复。");
    if (!ok) return;

    setIsDeleting(true);
    await ky.post('/api/money/garden/soy/delete', {
      json: { id }
    }).json();
    setIsDeleting(false);
    onSuccess();
  };

  // const updateHandle = async (id) => {
  //   setIsUpdating(true);
  //   try {
  //     await ky.post('/api/money/garden/soy/upsert', {
  //       json: {
  //         id,
  //         pname: values.category,
  //         titles: values.titles
  //       }
  //     }).json();
  //     onSuccess();
  //   } catch (error) {
  //     console.error("Error updating SoyBean:", error);
  //     const { errorMsg } = await error.response.json();
  //     toast.error(errorMsg);
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  return (
    <div className="flex items-center justify-center gap-2">

      <FormSoy trigger={
        <ActionButton icon={Pencil} />
      } defaultValues={
        {
          id: folder.id,
          category: folder.title,
          titles: folder.children.map(i => i.title).join("\n")
        }} onSuccess={onSuccess} key={`${folder?.id}-${editVer}`} />
      <ActionButton icon={Trash2} onClick={() => deleteHandle(folder.id)} disabled={isDeleting} />
    </div>
  )
}

export default FolderOpBar;