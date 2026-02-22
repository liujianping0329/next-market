"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, Pencil, Trash2, Share2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useGardenStore } from "@/store/gardenStore"
import { de } from "date-fns/locale";
import ky from "ky"
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner"
import FormGarden from "@/app/money/garden/_component/form/FormGarden";
import { gardenCategories, gardenCategoriesNoAll } from "@/app/money/garden/constants/gardenCategories";
import { MapPin } from "lucide-react";
import ActionButton from "@/components/ActionButton";

const GreengrassDetail = ({ id, showToolbar }) => {
  const router = useRouter()
  const [detail, setDetail] = useState(null)
  const [copied, setCopied] = useState(false)

  const [editVer, setEditVer] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchDetail = async () => {
    const response = await ky.post('/api/money/garden/list/match', {
      json: { id }
    }).json();
    setDetail(response.list[0]);
    setEditVer(prev => prev + 1)
  }

  useEffect(() => {
    fetchDetail();
  }, []);
  const handleShare = async () => {
    const url = window.location.href
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    if (isWeChat) {
      toast.info("请点击右上角 ··· 进行分享", { position: "top-left" })
      return
    }
    setCopied(true)
    window.location.href = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`
    setTimeout(() => setCopied(false), 1200)
  }

  const handleDelete = async () => {

    const ok = window.confirm("确定要删除吗？删除后无法恢复。");
    if (!ok) return;
    setDeleting(true);
    await ky.post("/api/money/garden/delete", { json: { id: detail.id } }).json();
    toast.success("已删除", { position: "top-left" });
    router.back();
    // 如果你路由不是这个路径，就改成你的列表路径
    setDeleting(false);
  };


  return (
    <>
      {showToolbar && detail && <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center border-b">
        <div className="flex space-x-2 items-center">
          <ActionButton icon={ArrowLeft} label="返回" onClick={() => router.back()} />
        </div>
        <div className="flex space-x-2 items-center">
          <FormGarden
            key={`${detail?.id}-${editVer}`}
            trigger={
              <ActionButton icon={Pencil} label="修改" />
            } onSuccess={() => fetchDetail()} defaultValues={detail} categories={gardenCategoriesNoAll} />
          <ActionButton icon={Trash2} label="删除" onClick={handleDelete} disabled={deleting || !detail} />
          <ActionButton icon={Share2} label="分享" onClick={handleShare} disabled={copied || !detail} />
        </div>
      </div>}
      <p className="whitespace-pre-line">
        <img
          src={detail?.pics?.[0]}
          className="w-full aspect-[3/4] object-contain bg-white"
        />
        {detail?.title}<br />
        {detail?.location?.name &&
          <Link href={detail?.location?.path} className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{detail?.location?.name}</span>
          </Link>
        }<br />
        {detail?.content}
      </p>
    </>
  );
}
export default GreengrassDetail;