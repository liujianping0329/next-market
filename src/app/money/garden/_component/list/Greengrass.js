import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import ky from "ky";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import FormGarden from "../form/FormGarden";
import { useRouter } from "next/navigation"
import { useGardenStore } from "@/store/gardenStore"

const Greengrass = () => {
  const [openGarden, setOpenGarden] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [subCategory, setSubCategory] = useState("all");
  const [list, setList] = useState([]);

  const [isLoadGarden, setIsLoadGarden] = useState(false);
  const [focused, setFocused] = useState(false)

  const router = useRouter()

  const fetchList = async () => {
    const response = await ky.post('/api/money/garden/list/match', {
      json: { topic: "Greengrass" }
    }).json();
    setList(response.list);
  }

  useEffect(() => {
    fetchList();
  }, []);

  const categories = [
    { value: "all", label: "全部" },
    { value: "recipe", label: "菜谱" },
    { value: "shop", label: "想去的店" },
    { value: "weekend", label: "周末好去处" },
    { value: "travel", label: "旅行" },
    { value: "else", label: "其他" }
  ];

  const filteredList = subCategory === "all" ? list
    : list.filter((item) => item.category === subCategory); // 按实际字段改
  return (
    <>
      <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            记录一些日常的好物分享，类似于小红书的种草笔记，偶尔也会有一些生活感悟之类的东西。
          </span>

          <div className="self-start">
            <Dialog open={openGarden} onOpenChange={setOpenGarden}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">新增记录</Button>
              </DialogTrigger>
              <DialogContent className="h-[95vh] max-h-[95vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>种草</DialogTitle>
                </DialogHeader>
                <div className={`flex-1 min-h-0 overflow-y-auto ${focused ? "pb-[320px]" : ""}`}>
                  <FormGarden onSuccess={() => {
                    setOpenGarden(false);
                    fetchList();
                  }} onFocusChange={setFocused} btnStatus={setIsLoadGarden} categories={categories.filter(c => c.value !== "all")} />
                  <DialogFooter className="pt-4">
                    <DialogClose asChild>
                      <Button variant="outline">关闭</Button>
                    </DialogClose>
                    <Button type="submit" form="formGarden" disabled={isLoadGarden}>
                      {isLoadGarden && <Spinner />}保存
                    </Button>
                  </DialogFooter>
                </div>

              </DialogContent>

            </Dialog>
            <Button size="sm" variant="outline" onClick={() => setExpanded(!expanded)}>
              {expanded ? "全收起" : "全展开"}
            </Button>
          </div>
        </div>
      </div>
      <div id="cateContainer" className="px-4 pt-2 flex gap-1 flex-wrap justify-center">
        {categories.map((cate) => (
          <Badge
            key={cate.value}
            onClick={() => setSubCategory(cate.value)}
            className={`cursor-pointer rounded-full px-2.5 py-0.5 text-sm transition
              ${subCategory === cate.value
                ? "bg-blue-50 text-blue-500"
                : "bg-transparent text-muted-foreground hover:bg-muted/40"
              }`}
          >
            {cate.label}
          </Badge>))}
      </div>
      <div id="cardContainer" className="p-4 space-y-4">
        {filteredList.map((item, index) => {

          const hasPic = !!item.pics?.[0];
          const len = item.title?.length || 0;
          const size =
            len <= 8 ? "text-4xl" :
              len <= 16 ? "text-lg" :
                "text-base";

          return (
            <Card key={item.id} onClick={() => router.push(`/money/garden/greengrass/${item.id}`)} className="mx-auto w-full max-w-sm pt-0 overflow-hidden">
              {hasPic ? (
                <img
                  src={item.pics[0]}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="relative aspect-video w-full overflow-hidden">

                  {/* 背景图 */}
                  <img
                    src="/gardenNoPic.png"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* 半透明遮罩（防止文字看不清） */}
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" /> */}

                  {/* 中间标题 */}
                  <div className="relative flex h-full items-center justify-center p-6 text-center">

                    <h3 className={`${size} font-semibold leading-snug text-black/100`}>
                      {item.title}
                    </h3>

                  </div>

                </div>
              )}
              <CardHeader>
                <CardAction>
                  {/* <Badge variant="secondary">Featured</Badge> */}
                </CardAction>
                {hasPic && <CardTitle>{item.title}</CardTitle>}
                <CardDescription>

                  <div className="mt-1 flex items-center text-xs text-muted-foreground">

                    {item.location?.name &&
                      <Link href={item.location.path} className="flex items-center gap-1 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{item.location?.name}</span>
                      </Link>
                    }

                    <span className="ml-auto shrink-0">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>

                  </div>
                  <p className={"mt-2 whitespace-pre-line " + (expanded ? "" : "line-clamp-3")}>
                    {item.content}
                  </p>
                </CardDescription>
              </CardHeader>
              <CardFooter />
            </Card>
          )
        })}
      </div>
    </>

  )
}

export default Greengrass;