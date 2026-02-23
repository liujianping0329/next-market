"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ca, fi } from "date-fns/locale";
import ky from "ky";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";
import { slugify } from "transliteration";
import { toast } from "sonner";

const FilterContent = ({ onConfirm }) => {

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openedCategory, setOpenedCategory] = useState(null);
  const [categories, setCategories] = useState(null);
  const [isLoadCategories, setIsLoadCategories] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [isSavingNew, setIsSavingNew] = useState(false);

  const fetchValues = async () => {
    setIsLoadCategories(true);
    const response = await ky.post('/api/constants/list/match', {
      json: { category: "gardenCategory" }
    }).json();
    setCategories(response.list);
    setIsLoadCategories(false);
  }

  useEffect(() => {
    fetchValues();
  }, []);

  const toggleAdd = () => {
    setIsAdding((v) => {
      const next = !v;
      if (!next) setNewLabel("");
      return next;
    });
  };

  const submitNewCategory = async () => {

    setIsSavingNew(true);
    try {
      await ky.post("/api/constants/upsert", {
        json: {
          category: "gardenCategory",
          label: newLabel,
          value: slugify(newLabel, {
            separator: "",
          })
        },
      }).json();
      fetchValues();
      setIsAdding(false);
      setNewLabel("");
    } catch (error) {
      if (error.errorCode) {
        toast.error(error.errorMsg);
      }
    } finally {
      setIsSavingNew(false);
    }
  };

  return (
    <>
      <div className="space-y-3 pb-6 px-4">
        {/* 标题：左侧粗竖线 */}
        <div className="flex items-center gap-4">
          <span className="h-5 w-1 rounded-sm bg-foreground/80" />
          <div className="font-semibold">类别</div>
          {isLoadCategories && <Spinner />}
          {categories && <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleAdd}
            className={cn(
              "rounded-full",
              isAdding ? "bg-muted" : "hover:bg-muted"
            )}
            aria-label={isAdding ? "取消新增类别" : "新增类别"}
          >
            {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>}
        </div>
        {isAdding && (
          <div className="flex items-center gap-2 px-3">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="新增类别名称"
              disabled={isSavingNew}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isSavingNew}
              className="bg-black text-white hover:bg-black/90"
              onClick={submitNewCategory}
            >
              {isSavingNew ? <Spinner /> : <Check className="h-5 w-5 stroke-[5]" />}
            </Button>
          </div>
        )}

        {/* 胶囊选项：单选 */}
        <div className="flex flex-wrap gap-2 px-3">
          {categories?.map((category) => {
            return (
              <Button
                key={category.id}
                onClick={() => {
                  setOpenedCategory(category?.children ? category : null);
                  setSelectedCategory(selectedCategory?.id === category.id ? null : category)
                  console.log("selected category:", selectedCategory?.id === category.id ? null : category);
                  console.log("opened category:", category?.children ? category : null);
                }}
                className={cn(
                  "px-4 py-2 text-sm rounded-md border-2 transition",
                  "bg-background hover:bg-muted",
                  selectedCategory?.id === category.id
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border text-foreground"
                )}
              >
                {category.label}
              </Button>
            );
          })}
        </div>

        {openedCategory && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-muted/40 border">
            <div className="text-sm font-medium mb-2 text-muted-foreground">子分类</div>

            <div className="flex flex-wrap gap-2">
              {openedCategory.children.map((child) => {
                return (
                  <Button
                    key={child.id}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory({
                        ...child,
                        _level: "child",
                        _parentId: openedCategory.id,
                      });
                      console.log("CCCselected category:", {
                        ...child,
                        _level: "child",
                        _parentId: openedCategory.id,
                      });
                    }}
                    className={cn(
                      "px-4 py-2 text-sm rounded-md border-2 transition",
                      "bg-background hover:bg-muted",
                      selectedCategory?.id === child.id
                        ? "border-foreground/60 bg-foreground text-background"
                        : "border-border text-foreground"
                    )}
                  >
                    {child.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div >
      {categories && <div className="py-2 flex items-center justify-center gap-2 border-y shadow-sm">

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
      </div>}
    </>
  )
}
export default FilterContent;