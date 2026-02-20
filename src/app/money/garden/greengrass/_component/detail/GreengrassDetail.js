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

const GreengrassDetail = ({ id, showToolbar }) => {
  const router = useRouter()
  const [detail, setDetail] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchDetail = async () => {
    const response = await ky.post('/api/money/garden/list/match', {
      json: { id }
    }).json();
    console.log(response);
    setDetail(response.list[0]);
  }

  useEffect(() => {
    fetchDetail();
  }, []);
  const handleShare = async () => {
    const url = window.location.href
    setCopied(true)
    await navigator.clipboard.writeText(url)
    toast.success("已复制链接", { position: "top-left" })
    setTimeout(() => setCopied(false), 1200)
  }


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
          <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <Pencil className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">修改</span>
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
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
      <p>
        <img src={detail?.pics?.[0]} className="w-full h-48 object-cover" />
        {detail?.title}<br />
        {detail?.content}
      </p>
    </>
  );
}
export default GreengrassDetail;