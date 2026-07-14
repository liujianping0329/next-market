
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import ky from "ky";
import { MapPin } from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import FormGarden from "../form/FormGarden";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import ListBar from "@/app/money/garden/_component/list/bar/ListBar";
import {
  SiTiktok,
  SiDazhongdianping,
  SiXiaohongshu,
} from "react-icons/si";
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const Greengrass = ({ userInfo }) => {
  const [expanded, setExpanded] = useState(false);
  const [subCategory, setSubCategory] = useState(null);
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const pathname = usePathname();
  const [keyword, setKeyword] = useState("");
  const [gardenLabels, setGardenLabels] = useState([]);

  const router = useRouter()

  const fetchData = async () => {
    const response = await ky.post('/api/money/garden/greenGrass/list', {
      json: {
        ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id })
      }
    }).json();
    setCategories(response.cates);
    setList(response.list);
  }

  useEffect(() => {
    fetchData();
    ky.get('/api/garden_labels/list').json().then((data) => {
      setGardenLabels(data.list);
    });
  }, [pathname]);

  const filteredList = list
    .filter((item) => {
      if (!subCategory) return true;

      return subCategory.includes("-")
        ? item.category === subCategory
        : item.category.startsWith(subCategory);
    })
    .filter((item) => {
      const text = keyword.trim().toLowerCase();

      if (!text) return true;

      return item.title?.toLowerCase().includes(text);
    });

  return (
    <>
      <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">
            采撷生活中的动人瞬间与好物灵感。在这里种下一片青草，记录日常的点滴感悟与美好发现。
          </span>

          <span className="inline-flex items-center gap-3 text-sm text-muted-foreground">
            <span>新增时可识别口令:</span>

            <SiTiktok
              className="size-[14px] text-black relative top-[0.5px]"
              style={{
                filter: `
        drop-shadow(0.8px 0 #25F4EE)
        drop-shadow(-0.8px 0 #FE2C55)
      `,
              }}
            />

            <SiDazhongdianping
              className="size-[13px] text-[#ffb300]"
              style={{
                filter: `
        drop-shadow(0 0 1px #ffe082)
      `,
              }}
            />

            <SiXiaohongshu
              className="size-[14px] text-[#ff2442]"
              style={{
                filter: `
        drop-shadow(0 0 1px #ff9db0)
      `,
              }}
            />

            {/* <SiYoutube
              className="size-[14px] text-[#ff0000]"
              style={{
                filter: `
        drop-shadow(0 0 1px #ff8080)
      `,
              }}
            /> */}

            {/* <SiGooglemaps
              className="size-[13px] text-[#34A853] relative top-[-0.5px]"
              style={{
                filter: `
        drop-shadow(0.8px 0 #4285F4)
        drop-shadow(-0.8px 0 #EA4335)
      `,
              }}
            /> */}
          </span>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="h-[30px] border-0 px-0 shadow-none focus-visible:ring-0"
                placeholder="搜索..."
              />
            </div>


            <FormGarden trigger={
              <Button size="sm" variant="outline">新增记录</Button>
            } onSuccess={() => fetchData()} categories={categories} />

            {/* <Button size="sm" variant="outline" onClick={() => setExpanded(!expanded)}>
              {expanded ? "全收起" : "全展开"}
            </Button> */}
          </div>
        </div>
      </div>
      <ListBar onApply={(category) => {
        setSubCategory(category);
        console.log("selected category:", category);
      }} />
      {/* <div id="cateContainer" className="px-4 pt-2 flex gap-1 flex-wrap justify-center">
        {gardenCategories.map((cate) => (
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
      </div> */}
      <div id="cardContainer" className="p-4 space-y-4 min-h-[100dvh]">
        {filteredList.map((item, index) => {

          const hasPic = !!item.pics?.[0];
          const len = item.title?.length || 0;
          const size =
            len <= 8 ? "text-4xl" :
              len <= 16 ? "text-lg" :
                "text-base";
          const itemLabels = gardenLabels.filter(
            (gardenLabel) =>
              Number(gardenLabel.gardenId) === Number(item.id)
          );

          return (
            <Card key={item.id} onClick={() => router.push(`/money/garden/greengrass/${item.id}`)} className="mx-auto w-full max-w-sm pt-0 overflow-hidden">
              {hasPic ? (
                <div className="relative">
                  <img
                    src={item.pics[0]}
                    loading="lazy"
                    decoding="async"
                    className="aspect-video w-full object-cover"
                  />

                  {/* 左上角评分 */}
                  {item.point && <div className="absolute top-0 left-0 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    {Array.from({ length: item.point }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>}
                </div>
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

                  {/* 左上角评分 */}
                  {item.point && <div className="absolute top-0 left-0 flex items-center gap-0.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    {Array.from({ length: item.point }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>}

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
                  {itemLabels.length > 0 && (
                    <div className="mt-1 flex flex-wrap items-center text-xs text-muted-foreground">

                      {itemLabels.map(label => (
                        <span key={label.label.id} className="mr-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-medium text-sky-800">
                          {label.label.name}
                        </span>
                      ))}

                    </div>)}
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