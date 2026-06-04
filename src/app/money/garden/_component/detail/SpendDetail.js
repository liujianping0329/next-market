"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldSeparator
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import ky from "ky";
import { Textarea } from "@/components/ui/textarea"

import Datepicker from "@/components/datepicker";
import StarBar from "@/components/StarBar";
import { formatDateLocal, parseLocalDate } from "@/app/utils/date";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FormHarvest from "@/app/money/garden/_component/form/FormHarvest";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import supabase from "@/app/utils/database";
import { Pencil, Trash2 } from "lucide-react";
import FormGranary from "@/app/money/garden/_component/form/FormGranary";
import { useGranaryStore } from "@/app/money/garden/_store/granaryStore";
import { getDiffClassName, formatDiff } from "@/app/utils/numDiff";
import { useUserStore } from "@/app/money/garden/_store/userStore"

const SpendDetail = ({ open, onOpenChange, target, onSuccess }) => {
  const [userId, setUserId] = useState(false);
  const [detail, setDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDfValue, setEditDfValue] = useState([]);
  const [editVersion, setEditVersion] = useState(0);

  const cashStore = useGranaryStore(state => state.cash);
  const userInfoStore = useUserStore(state => state.userInfo);

  const fetchDetail = async () => {
    if (!target?.id) return;

    const response = await ky.post("/api/spend/list/match", {
      json: {
        planetId: userInfoStore?.planetId,
      },
    }).json();

    setDetail(response.list);
  };

  useEffect(() => {
    if (!target) return;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
    };

    loadSession();
    fetchDetail();
  }, [target]);

  const handleEdit = (detailList) => {
    setEditDfValue({ date: detail.date, detailList });
    setEditVersion(v => v + 1);
    setEditOpen(true);
  };

  const handleDelete = async () => {
    if (!detail?.id || deleting) return;

    const ok = window.confirm("确定删除？");
    if (!ok) return;

    setDeleting(true);
    try {
      await ky.post("/api/spend/delete", {
        json: { id: detail.id, userId },
      }).json();

      toast.success("删除成功");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("删除失败");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {detail && (
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[100dvh] flex flex-col px-4 pb-0">
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-xl font-semibold">详情</DrawerTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex flex-wrap justify-center gap-3">
                  <div>结算日:{detail.date}</div>
                </div>
              </div>
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {detail.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="font-medium">名称: {item.title}</div>
                      <div className={`flex flex-col gap-1 font-mono ${getDiffClassName(item.amount)}`}>
                        <span>金额: {formatDiff(item.amount)}</span>
                        <span>日期: {item.date}</span>
                        <span>币种: {item.cashType}</span>
                        <span>用户: {item.userId}</span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">类别: {item.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default SpendDetail;
