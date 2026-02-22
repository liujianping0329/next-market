import { Filter, ArrowUpDown, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import FilterContent from "@/app/money/garden/_component/list/bar/FilterContent";

const ListBar = ({ onApply }) => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("filter");
  const barRef = useRef(null);

  const openTo = (type) => {
    if (open && active === type) {
      setOpen(false);
      return;
    }

    setActive(type);
    // ✅ 先把工具栏滚到视口顶部，让 sticky 生效
    barRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // ✅ 再打开抽屉（等滚动开始/完成一点点）
    setTimeout(() => {
      setOpen(true);
    }, 350);
  };

  useEffect(() => {
    if (!open) return;

    // 记录原状态（避免你页面本来就有自定义 overflow）
    const prevOverflow = document.body.style.overflow;

    // ✅ 锁滚动
    document.body.style.overflow = "hidden";

    // 关闭/卸载时恢复
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);


  return (
    <>
      <div ref={barRef} className="sticky top-0 z-50 flex bg-background items-center border-y shadow-sm px-3 py-2 mt-3">
        <div className="flex flex-1 justify-center">
          <Button variant="ghost" className="h-9 gap-2" onClick={() => openTo("filter")}>
            <Filter className="h-4 w-4" />
            筛选
            <ChevronDown
              className={cn(
                "h-4 w-4 transition",
                open && active === "filter" && "rotate-180"
              )}
            />
          </Button>
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex flex-1 justify-center">
          <Button variant="ghost" className="h-9 gap-2" onClick={() => openTo("sort")}>
            <ArrowUpDown className="h-4 w-4" />
            排序
            <ChevronDown
              className={cn(
                "h-4 w-4 transition",
                open && active === "sort" && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* ✅ 抽屉：浮在列表上层，贴着工具栏下边缘 */}
      {open && (
        <div className="fixed left-0 right-0 top-[53px] z-50">
          <div className="border-b bg-background shadow-sm rounded-b-md">
            <div className="pt-4 overflow-auto">
              {active === "filter" && (
                <FilterContent onConfirm={(category) => {
                  onApply(category);
                  setOpen(false);
                }} />
              )}

              {active === "sort" && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">排序</div>
                  <div className="text-sm text-muted-foreground">
                    这里放你的排序项...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default ListBar;