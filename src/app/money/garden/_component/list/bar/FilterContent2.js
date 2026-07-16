"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useEffect,
  useState,
} from "react";

import { useUserStore } from "@/app/money/garden/_store/userStore";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";

const FilterContent2 = ({ onConfirm, labels }) => {

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState(null);
  const [isLoadCategories, setIsLoadCategories] = useState(false);

  const [subCategories, setSubCategories] = useState([]);
  const [selLabels, setSelLabels] = useState([]);

  const userInfoStore = useUserStore(state => state.userInfo);
  const fetchValues = async () => {
    setIsLoadCategories(true);
    const response = await ky.post('/api/garden_cate/list/match', {
      json: { planetId: userInfoStore.planet.id, parentNull: true, status: 1 }
    }).json();
    setCategories(response.list);
    setIsLoadCategories(false);
    return response.list;
  }

  useEffect(() => {
    fetchValues();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;
    setSubCategories([
      ...new Map(labels.filter(label => label?.cate?.id === selectedCategory?.id)
        .map((label) => [label?.subCate?.id, label])).values(),
    ].map(subCate => ({
      ...subCate,
      labels: [... new Map(labels.filter(l => l?.subCate?.id === subCate?.subCate?.id)
        .map((label) => [label?.label?.id, label])).values()],
    })));
  }, [selectedCategory, labels]);

  return (
    <>
      <div className="space-y-3 pb-6 px-4">
        {/* 标题：左侧粗竖线 */}
        <div className="flex items-center gap-4">
          <span className="h-5 w-1 rounded-sm bg-foreground/80" />
          <div className="font-semibold">类别</div>
          {isLoadCategories && <Spinner />}
        </div>

        {/* 胶囊选项：单选 */}
        <div className="flex flex-wrap gap-2 px-3">
          {categories?.map((category) => {
            return (
              <Button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category)
                }}
                className={cn(
                  "px-4 py-2 text-sm rounded-md border-2 transition",
                  "bg-background hover:bg-muted",
                  selectedCategory?.id === category.id
                    ? "border-foreground/60 bg-foreground text-background"
                    : "border-border text-foreground"
                )}
              >
                {category.name}
              </Button>
            );
          })}
        </div>

        <div className="max-h-96 overflow-y-auto mt-[-10px]">
          {subCategories.length > 0 && subCategories.map((subCategory) => (
            <div key={subCategory?.subCate?.id} className="mt-4 px-4 py-3 rounded-lg bg-muted/40 border">
              <div className="text-sm font-medium mb-2 text-muted-foreground">{subCategory?.subCate?.name}</div>

              <div className="flex flex-wrap gap-2">
                {subCategory.labels.map((item) => {
                  const subCateId = item?.subCate?.id;
                  const labelId = item?.label?.id;

                  const isSelected = selLabels.some(
                    (group) =>
                      group.subCateId === subCateId &&
                      group.labelIds.includes(labelId)
                  );

                  return (
                    <Button
                      key={labelId}
                      size="sm"
                      onClick={() => {
                        setSelLabels((prev) => {
                          const subCateGroup = prev.find(
                            (group) => group.subCateId === subCateId
                          );

                          if (!subCateGroup) {
                            return [
                              ...prev,
                              {
                                subCateId,
                                labelIds: [labelId],
                              },
                            ];
                          }

                          const alreadySelected =
                            subCateGroup.labelIds.includes(labelId);

                          const next = prev.map((group) => {
                            if (group.subCateId !== subCateId) {
                              return group;
                            }

                            return {
                              ...group,
                              labelIds: alreadySelected
                                ? group.labelIds.filter((id) => id !== labelId)
                                : [...group.labelIds, labelId],
                            };
                          });

                          return next.filter((group) => group.labelIds.length > 0);
                        });
                      }}
                      className={cn(
                        "rounded-md border-2 px-4 py-2 text-sm transition",
                        "bg-background hover:bg-muted",
                        isSelected
                          ? "border-foreground/60 bg-foreground text-background"
                          : "border-border text-foreground"
                      )}
                    >
                      {item?.label?.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div >
      {categories && <div className="py-2 flex items-center justify-center gap-2 border-y shadow-sm">

        <Button
          variant="outline"
          className="w-2/5"
          onClick={() => {
            setSelectedCategory(null);
            setSelLabels([]);
            setSubCategories([]);
          }}
        >
          重置
        </Button>
        <div className="w-1/40" />
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground w-2/5"
          onClick={() => {
            onConfirm(selectedCategory, selLabels);
          }}
        >
          确定
        </Button>
      </div>}
    </>
  )
}
export default FilterContent2;