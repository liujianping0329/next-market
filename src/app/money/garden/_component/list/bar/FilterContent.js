import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ca } from "date-fns/locale";
import ky from "ky";

const FilterContent = ({ onConfirm }) => {

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState(null);

  const fetchValues = async () => {
    const response = await ky.post('/api/constants/list/match', {
      json: { category: "gardenCategory" }
    }).json();
    setCategories(response.list);
  }

  useEffect(() => {
    fetchValues();
  }, []);

  return (
    <>
      <div className="space-y-3 pb-6 px-4">
        {/* 标题：左侧粗竖线 */}
        <div className="flex items-center gap-4">
          <span className="h-5 w-1 rounded-sm bg-foreground/80" />
          <div className="font-semibold">类别</div>
        </div>

        {/* 胶囊选项：单选 */}
        <div className="flex flex-wrap gap-2 px-3">
          {categories?.map((category) => {
            return (
              <Button
                key={category.id}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category ? null : category)
                }
                className={cn(
                  "px-4 py-2 text-sm rounded-md border-2 transition",
                  "bg-background hover:bg-muted",
                  selectedCategory === category
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border text-foreground"
                )}
              >
                {category.label}
              </Button>
            );
          })}
        </div>
      </div >
      <div className="py-2 flex items-center justify-center gap-2 border-y shadow-sm">

        <Button
          variant="outline"
          className="w-2/5"
        // onClick={() => { }}
        >
          重置
        </Button>
        <div className="w-1/40" />
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground w-2/5"
          onClick={() => {
            onConfirm(selectedCategory?.value);
          }}
        >
          确定
        </Button>
      </div>
    </>
  )
}
export default FilterContent;