"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, Pencil, Trash2, Share2, ArrowLeft, BookOpenCheck, Landmark } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { useGardenStore } from "@/store/gardenStore"
import { de } from "date-fns/locale";
import ky from "ky"
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner"
import FormGarden from "@/app/money/garden/_component/form/FormGarden";
import FormSoy from "@/app/money/garden/_component/form/FormSoy";
import FormGardenRemark from "@/app/money/garden/_component/form/FormGardenRemark";
import { gardenCategories, gardenCategoriesNoAll } from "@/app/money/garden/constants/gardenCategories";
import { MapPin, MessageSquare, Sparkles, Loader2, KeyRound } from "lucide-react";
import ActionButton from "@/components/ActionButton";
import ImageCarousel from "@/components/ImageCarousel";
import FormHarvest from "@/app/money/garden/_component/form/FormHarvest";
import { convertCateName } from "@/app/utils/data";
import StarBar from "@/components/StarBar";

const GreengrassDetail = ({ id, showToolbar, showRemarkbar, cssTips }) => {
  const router = useRouter()
  const [detail, setDetail] = useState(null)
  const [copied, setCopied] = useState(false)

  const [editVer, setEditVer] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [aiing, setAiing] = useState(false);

  const fetchDetail = async () => {
    const response = await ky.post('/api/money/garden/greenGrass/detail', {
      json: { id }
    }).json();
    console.log(response.detail);
    setDetail(response.detail);
    setCategories(response.cates);
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

  const handleAi = async () => {
    toast.info("已提交任务，请稍后")
    await ky.post("/api/ai/obtain", { json: { type: "garden", ...detail } }).json();

    fetchDetail();
  }
  const handlePassCode = () => {
    navigator.clipboard.writeText(detail.passCode);
    toast.info("口令已复制到剪贴板")
  }
  return (
    <>
      {showToolbar && detail && categories && <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center border-b">
        <div className="flex space-x-2 items-center">
          <ActionButton icon={ArrowLeft} label="返回" onClick={() => router.back()} />
        </div>
        <div className="flex space-x-2 items-center">
          <ActionButton onClick={handlePassCode} icon={KeyRound} label="口令" />
          <FormGarden
            key={`${detail?.id}-${editVer}`}
            trigger={
              <ActionButton icon={Pencil} label="修改" />
            } onSuccess={() => fetchDetail()} defaultValues={detail} categories={categories} />
          <ActionButton icon={Trash2} label="删除" onClick={handleDelete} disabled={deleting || !detail} />
          {/* <ActionButton icon={Share2} label="分享" onClick={handleShare} disabled={copied || !detail} /> */}

          <FormSoy trigger={
            <ActionButton icon={BookOpenCheck} label="待办" />
          } defaultValues={
            {
              category: `【${convertCateName(detail.category, categories) || "未分类"
                }】${detail.title}`,
              titles: detail?.content
            }} onSuccess={() => {
              fetchDetail()
              toast.success("已添加到待办");
            }} />

          <FormHarvest trigger={
            <ActionButton icon={Landmark} label="行程" />
          } defaultValues={
            {
              gardenId: detail?.id
            }} onSuccess={() => {
              fetchDetail()
              toast.success("已添加到行程");
            }} />
          <ActionButton onClick={handleAi} icon={Sparkles} label="润色" />
        </div>
      </div>}

      {detail && showRemarkbar && <div id="toolBarBottom" className="fixed bottom-0 left-0 right-0 flex p-2.5 justify-center overflow-x-auto items-center border-t bg-background">
        <FormGardenRemark
          key={`${detail?.id}-${editVer}`}
          trigger={
            <ActionButton icon={MessageSquare} label="点评" />
          } onSuccess={() => fetchDetail()} defaultValues={detail} />
      </div>}


      <ImageCarousel images={detail?.pics} ratio={cssTips?.ImageCarousel?.ratio || 3 / 4} />
      {/* <img
          src={detail?.pics?.[0]}
          className="w-full aspect-[3/4] object-contain bg-white"
        /> */}
      <p className="whitespace-pre-line pb-20">
        {detail?.title}<br />
        {detail && `评分:${detail?.point}`}<br />
        {/* {detail && <StarBar value={detail?.point} />} */}
        {detail && `点评:${detail?.remark}`}<br />
        {detail?.location?.name &&
          <Link href={detail?.location?.path} className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{detail?.location?.name}</span>
          </Link>
        }<br />
        {detail?.content}
      </p>
      {detail?.garden_ai?.length > 0 && (
        <>
          {detail.garden_ai.map((data, i) => (
            <div key={data.id} className="rounded-2xl border bg-white p-5 shadow-sm pb-20">
              <div className="mb-4 flex items-center gap-2 text-sky-700">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-base font-semibold">AI 补充介绍</h3>
              </div>

              <div className="rounded-xl bg-sky-50 px-4 py-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {data?.ansJSON.desp || "暂无内容"}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
export default GreengrassDetail;