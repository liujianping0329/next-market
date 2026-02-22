import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FilterContent = () => {

  const [selected, setSelected] = useState(null);

  return (
    <>
      {/* 标题：左侧粗竖线 */}
      <div className="flex items-center gap-4">
        <span className="h-5 w-1 rounded-sm bg-foreground/80" />
        <div className="font-semibold">123</div>
      </div>

      {/* 胶囊选项：单选 */}
      <div className="flex flex-wrap gap-2 px-3">
        <Button
          // key={opt.value}
          onClick={() =>
            setSelected(selected === "1" ? null : "1")
          }
          className={cn(
            "px-4 py-2 text-sm rounded-md border-2 transition",
            "bg-background hover:bg-muted",
            selected === "1"
              ? "border-foreground/60 bg-foreground text-background"
              : "border-border text-foreground"
          )}
        >
          1
        </Button>
        <Button
          // key={opt.value}
          onClick={() =>
            setSelected(selected === "2" ? null : "2")
          }
          className={cn(
            "px-4 py-2 text-sm rounded-md border-2 transition",
            "bg-background hover:bg-muted",
            selected === "2"
              ? "border-foreground/60 bg-foreground text-background"
              : "border-border text-foreground"
          )}
        >
          2
        </Button>
      </div>
    </>
  )
}
export default FilterContent;