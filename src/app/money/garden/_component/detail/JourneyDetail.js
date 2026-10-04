"use client";
import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, Circle, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import ky from "ky";
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail"
import {
  Hotel,
  Airplane,
  Notes
} from "@icon-park/react";

const JourneyDetail = ({ open, onOpenChange, target, onSuccess }) => {
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editLink, setEditLink] = useState("");

  useEffect(() => {
    if (open && !target?.harvest) {
      toast.error("当前没有可显示的记录");
      onOpenChange(false);
      return;
    }

    if (!open || !target?.harvest?.id) return;
    let isActive = true;
    setItems([]);
    ky.post("/api/money/harvest/item/list", {
      json: { harvestId: target.harvest.id },
    }).json().then((response) => {
      if (isActive) setItems(response.list);
    }).catch(() => {
      if (isActive) toast.error("待办事项加载失败");
    });

    return () => {
      isActive = false;
    };
  }, [open, target?.harvest?.id, onOpenChange]);

  const updateItem = async (itemId, changes) => {
    try {
      await ky.post("/api/money/harvest/item/update", {
        json: { id: itemId, ...changes },
      }).json();
      setItems((current) => current.map((item) =>
        item.id === itemId ? { ...item, ...changes } : item
      ));
      onSuccess();
      return true;
    } catch {
      toast.error("待办事项更新失败");
      return false;
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm("确定删除这条待办吗？")) return;
    try {
      await ky.post("/api/money/harvest/item/delete", {
        json: { id: itemId },
      }).json();
      setItems((current) => current.filter((item) => item.id !== itemId));
      onSuccess();
    } catch {
      toast.error("待办事项删除失败");
    }
  };

  const openEdit = (item) => {
    setEditingItemId(item.id);
    setEditText(item.text || "");
    setEditLink(item.link || "");
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditText("");
    setEditLink("");
  };

  const saveEdit = async () => {
    if (editingItemId == null) return;
    const saved = await updateItem(editingItemId, {
      text: editText.trim(),
      link: editLink.trim() || null,
    });
    if (saved) cancelEdit();
  };

  const curDate = target?.harvest?.startTime && target?.harvest?.startTime.split(" ")[0].split("-")[2] + "日";
  return (
    <>
      {target?.harvest && <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[80dvh] flex flex-col px-4 pb-0">
          <DrawerHeader>
            <DrawerTitle className="text-xl">详情</DrawerTitle>
          </DrawerHeader>
          <Tabs defaultValue={curDate}
            className="flex flex-1 min-h-0 flex-col">
            <TabsList variant="line">
              <TabsTrigger key={curDate} value={curDate}>{curDate}</TabsTrigger>
            </TabsList>

            <TabsContent key={curDate} value={curDate}
              className="flex flex-1 min-h-0 flex-col">
              <div className="mt-4 shrink-0 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium leading-7 text-slate-800">
                      {target.harvest.title || "未填写说明"}
                    </p>
                  </div>

                  {target.harvest.journeyType === "flight" && <Airplane
                    theme="two-tone"
                    size="35"
                    strokeWidth={3}
                    fill={["#7c3aed", "#ddd6fe"]}
                    className="mt-0.5 size-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                  />}
                  {target.harvest.journeyType === "hotel" && <Hotel
                    theme="two-tone"
                    size="35"
                    strokeWidth={3}
                    fill={["#0369a1", "#bae6fd"]}
                    className="mt-0.5 size-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                  />}
                  {target.harvest.journeyType === "memo" && <Notes
                    theme="two-tone"
                    size="35"
                    strokeWidth={3}
                    fill={["#d97706", "#fef3c7"]}
                    className="mt-0.5 size-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                  />}
                </div>
              </div>

              <div className="mt-4 min-h-0 space-y-0.5 overflow-y-auto rounded-xl bg-rose-50 px-3 py-2">
                {items.length === 0 ? (
                  <p className="py-3 text-center text-sm text-muted-foreground">暂无待办事项</p>
                ) : items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 py-1">
                    {editingItemId === item.id ? (
                      <div className="min-w-0 flex-1 space-y-2">
                        <Input autoFocus value={editText} onChange={(event) => setEditText(event.target.value)} />
                        <Input value={editLink} onChange={(event) => setEditLink(event.target.value)} placeholder="链接（可选）" />
                      </div>
                    ) : <button
                      type="button"
                      aria-label={item.status === 1 ? "标记为未完成" : "标记为完成"}
                      onClick={() => updateItem(item.id, { status: item.status === 1 ? 0 : 1 })}
                      className="shrink-0 text-muted-foreground"
                    >
                      {item.status === 1
                        ? <Check className="size-5 rounded-full border border-current p-0.5" />
                        : <Circle className="size-5" />}
                    </button>}
                    {editingItemId !== item.id && <span className={`min-w-0 flex-1 break-words whitespace-pre-wrap text-sm ${item.status === 1 ? "text-muted-foreground line-through" : ""}`}>
                      {item.text || item.link || "链接"}
                    </span>}
                    <div className="-mr-1 flex shrink-0 items-center">
                      {editingItemId === item.id ? <>
                        <Button type="button" variant="ghost" size="icon" aria-label="Save" onClick={saveEdit}>
                          <Check className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" aria-label="Cancel" onClick={cancelEdit}>
                          <X className="size-4" />
                        </Button>
                      </> : <>
                        <Button type="button" variant="ghost" size="icon" aria-label="修改待办" onClick={() => openEdit(item)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="打开链接"
                          disabled={!item.link || !/^https?:\/\//i.test(item.link)}
                          onClick={() => window.open(item.link, "_blank", "noopener,noreferrer")}
                        >
                          <ExternalLink className="size-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" aria-label="删除待办" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </>}
                    </div>
                  </div>
                ))}
              </div>

              {target?.harvest.gardenId && (
                <div className="mt-4 flex-1 min-h-0 overflow-y-auto rounded-xl">
                  <GreengrassDetail id={target.harvest.gardenId} showToolbar={false} showRemarkbar={false}
                    cssTips={{
                      ImageCarousel: {
                        ratio: 16 / 9
                      }
                    }} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>}



    </>
  );
}

export default JourneyDetail;
