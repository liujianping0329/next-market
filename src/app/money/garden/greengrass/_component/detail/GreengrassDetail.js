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
import { gardenCategories, gardenCategoriesNoAll } from "@/app/money/garden/_component/constants/gardenCategories";
import { MapPin } from "lucide-react";

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
      {showToolbar && <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center border-b">
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">返回</span>
            </span>
          </Button>
        </div>
        <div className="flex space-x-2 items-center">
          {detail && (
            <FormGarden
              key={`${detail?.id}-${editVer}`}
              trigger={
                <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
                  <span className="flex flex-col items-center gap-1">
                    <Pencil className="h-5 w-5" />
                    <span className="text-[11px] leading-none text-muted-foreground">修改</span>
                  </span>
                </Button>
              } onSuccess={() => fetchDetail()} defaultValues={detail} categories={gardenCategoriesNoAll} />
          )}


          <Button variant="ghost" size="sm" className="h-auto px-2 py-2" onClick={handleDelete}
            disabled={deleting || !detail}>
            <span className="flex flex-col items-center gap-1">
              <Trash2 className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">删除</span>
            </span>
          </Button>

          <Button variant="ghost" size="sm" disabled={copied} className="h-auto px-2 py-2"
            onClick={handleShare}>
            <span className="flex flex-col items-center gap-1">
              <Share2 className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">
                分享
              </span>
            </span>
          </Button>
        </div>
      </div >}
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