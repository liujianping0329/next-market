"use client";
import Link from "next/link";

import ky from "ky";
import {
  ArrowLeft,
  BookOpenCheck,
  Landmark,
  Library,
  Pencil,
  Trash2,
  MessageSquarePlus,
  MessagesSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import FormGarden from "@/app/money/garden/_component/form/FormGarden";
import FormGardenRef from "@/app/money/garden/_component/form/FormGardenRef";
import FormGardenRemark from "@/app/money/garden/_component/form/FormGardenRemark";
import FormSoy from "@/app/money/garden/_component/form/FormSoy";
import { toast } from "sonner";

import FormHarvest from "@/app/money/garden/_component/form/FormHarvest";
import { convertCateName } from "@/app/utils/data";
import ActionButton from "@/components/ActionButton";
import ImageCarousel from "@/components/ImageCarousel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  ExternalLink,
  KeyRound,
  LinkIcon,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { useUserStore } from "@/app/money/garden/_store/userStore";


const GreengrassDetail = ({ id, showToolbar, showRemarkbar, cssTips }) => {
  const router = useRouter()
  const [detail, setDetail] = useState(null)
  const [copied, setCopied] = useState(false)

  const [editVer, setEditVer] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [aiing, setAiing] = useState(false);
  const userInfoStore = useUserStore(state => state.userInfo);

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

  const normalizePics = (pics) => {
    if (!pics) return [];

    if (Array.isArray(pics)) {
      return pics.flatMap(normalizePics);
    }

    if (typeof pics === "string") {
      const text = pics.trim();

      if (!text || text === "[]") return [];

      if (text.startsWith("[") && text.endsWith("]")) {
        try {
          return normalizePics(JSON.parse(text));
        } catch {
          return [];
        }
      }

      if (text.startsWith("http")) {
        return [text];
      }
    }

    return [];
  };

  const carouselImages = [
    ...normalizePics(detail?.pics),
    ...normalizePics(detail?.garden_remark?.map((remark) => remark.pics)),
  ];

  return (
    <>
      {showToolbar && detail && categories && <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center border-b">
        <div className="flex space-x-2 items-center">
          <ActionButton icon={ArrowLeft} label="返回" onClick={() => router.back()} />
        </div>
        <div className="flex space-x-2 items-center">
          <ActionButton onClick={handlePassCode} icon={KeyRound} label="口令" />
          <ActionButton onClick={async () => {
            await ky.post("/api/garden_remark/inviteWithPush", { json: { planetId: userInfoStore?.planetId, detail } }).json();
          }} icon={MessagesSquare} label="邀评" />
          <FormGardenRef
            key={`${detail?.id}-${editVer}-ref`}
            trigger={
              <ActionButton icon={Library} label="参考" />
            } onSuccess={() => fetchDetail()} defaultValues={detail.garden_ext ?? { gardenId: detail.id }} />

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
          <FormGarden
            key={`${detail?.id}-${editVer}`}
            trigger={
              <ActionButton icon={Pencil} label="修改" />
            } onSuccess={() => fetchDetail()} defaultValues={detail} categories={categories} />
          <ActionButton icon={Trash2} label="删除" onClick={handleDelete} disabled={deleting || !detail} />
          <ActionButton onClick={handleAi} icon={Sparkles} label="润色" />
        </div>
      </div>}

      {/* {detail && showRemarkbar && <div id="toolBarBottom" className="fixed bottom-0 left-0 right-0 flex p-2.5 justify-center overflow-x-auto items-center border-t bg-background">
        <FormGardenRemark
          key={`${detail?.id}-${editVer}`}
          trigger={
            <ActionButton icon={MessageSquare} label="点评" />
          } onSuccess={() => fetchDetail()} defaultValues={detail} />
      </div>} */}

      <ImageCarousel images={carouselImages} ratio={cssTips?.ImageCarousel?.ratio || 3 / 4} />
      {detail && (
        <main className="rounded-t-[28px] bg-background px-5 pt-2 pb-28">
          {/* 标题 + 评分 */}
          <section className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {detail.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{convertCateName(detail.category, categories) || "未分类"}</span>

                {detail.price && (
                  <>
                    <span>・</span>
                    <span>¥{detail.price} / 人</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex h-20 w-24 shrink-0 flex-col items-center justify-center rounded-xl bg-muted">
              <div className="text-3xl font-bold">
                {detail.point ? Number(detail.point).toFixed(1) : "0.0"}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">评分</div>
            </div>
          </section>

          {/* 地点 */}
          {(detail.location?.path || detail.garden_ext?.refInfo) && (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={detail.location.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
        group inline-flex max-w-full items-center gap-1.5
        rounded-full border border-sky-100 bg-sky-50/80
        px-3 py-1.5 text-sm text-sky-700
        shadow-sm transition
        hover:border-sky-200 hover:bg-sky-100 hover:text-sky-800
        active:scale-[0.98]
      "
                >
                  <LinkIcon className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate underline-offset-4 group-hover:underline">
                    {detail.location.name || "查看原始链接"}
                  </span>
                  {/* {detail.created_at && (
                  <span className="ml-1 shrink-0 text-[10px] text-sky-500/70">
                    {formatDistanceToNow(new Date(detail.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                )} */}

                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
                </Link>
                {detail?.garden_ext?.refInfo.map((refItem, index) => {
                  return (<Link
                    key={`${refItem.url}-${index}`}
                    href={refItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
        group inline-flex max-w-full items-center gap-1.5
        rounded-full border border-sky-100 bg-sky-50/80
        px-3 py-1.5 text-sm text-sky-700
        shadow-sm transition
        hover:border-sky-200 hover:bg-sky-100 hover:text-sky-800
        active:scale-[0.98]
      "
                  >
                    <LinkIcon className="h-3.5 w-3.5 shrink-0" />

                    <span className="truncate underline-offset-4 group-hover:underline">
                      {refItem.name}
                    </span>
                    {/* {detail.created_at && (
                  <span className="ml-1 shrink-0 text-[10px] text-sky-500/70">
                    {formatDistanceToNow(new Date(detail.created_at), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </span>
                )} */}

                    <ExternalLink className="h-3 w-3 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
                  </Link>);
                })}
              </div>
            </>
          )}

          {/* 内容 */}
          {detail.content && (
            <section className="mt-2">
              <div className="rounded-2xl bg-muted/50 px-5 py-4">
                <p className="whitespace-pre-wrap text-sm leading-8 text-muted-foreground">
                  {detail.content}
                </p>
              </div>
            </section>
          )}

          {/* AI 补充介绍 */}
          {detail?.garden_ai?.length > 0 && (
            <section className="mt-4 rounded-2xl bg-sky-50 px-5 py-5">
              <div className="mb-4 flex items-center gap-2 text-sky-700">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">AI 补充介绍</h3>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-8 text-gray-700">
                {detail.garden_ai[0]?.ansJSON?.desp || "暂无内容"}
              </p>
            </section>
          )}
          {/* 评论 */}
          <section className="mt-8">
            <h3 className="flex justify-between mb-2 text-base font-semibold">
              <span>用户评论（{detail.garden_remark.length}）</span>
              {userInfoStore?.id && (<FormGardenRemark
                key={`${detail?.id}-${editVer}-remark`}
                trigger={
                  <ActionButton icon={MessageSquarePlus} />
                } onSuccess={() => fetchDetail()} detail={detail} />)}

            </h3>

            <div className="divide-y">
              {detail?.garden_remark?.length > 0 &&
                <>
                  {
                    detail.garden_remark.map((data) => (
                      <div key={data.id} className="flex gap-3 py-5">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={data?.f_user?.raw_user_meta_data?.avatar_url}
                            alt="img"
                          />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-medium">
                              {data?.f_user?.raw_user_meta_data?.name || "用户"}
                            </span>

                            {data?.point && (
                              <span className="shrink-0 text-xs text-yellow-500">
                                {"★".repeat(Number(data.point))}
                              </span>
                            )}
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                            {data?.remark}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </>
              }
            </div>
          </section>
        </main>
      )}
    </>
  );
}
export default GreengrassDetail;