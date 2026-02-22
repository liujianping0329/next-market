import { Filter, ArrowUpDown, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ListBar = () => {
  const barRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("filter");

  const openTo = (type) => {
    if (open && active === type) {
      setOpen(false);
      return;
    }

    setActive(type);

    // 先滚到顶部对齐
    barRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // 稍微延迟后展开
    setTimeout(() => {
      setOpen(true);
    }, 150);
  };

  return (
    <div ref={barRef} className="flex items-center border-y bg-muted/30 px-3 py-2 mt-3">
      <div className="flex flex-1 justify-center">
        <Button
          variant="ghost"
          className="h-9 gap-2"
          onClick={() => openTo("filter")}
        >
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
        <Button
          variant="ghost"
          className="h-9 gap-2"
          onClick={() => openTo("sort")}
        >
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
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
export default ListBar;