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

const GranaryDetail = ({ open, onOpenChange, target, onSuccess }) => {
  const [userId, setUserId] = useState(false);
  const [detail, setDetail] = useState(false);

  const fetchDetail = async () => {
    const response = await ky.post('/api/granary/detail', {
      json: {
        granaryId: target.id,
        userId
      }
    }).json();
    setDetail(response.detail);
  }

  useEffect(() => {
    if (!target) return
    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setUserId(data.session?.user?.id ?? null);
    };

    loadSession();
    fetchDetail();
  }, [target]);

  return (
    <>
      {detail && <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[100dvh] flex flex-col px-4 pb-0">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-xl font-semibold">详情</DrawerTitle>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="flex gap-3 flex-wrap justify-center">
                <div>结算日:{detail.date}</div>
              </div>
            </div>
          </DrawerHeader>
          <Tabs defaultValue={userId ?? -1}
            className="flex flex-1 min-h-0 flex-col">
            <TabsList variant="line">
              {detail.granary_user_sum.map((n, i) => (
                <TabsTrigger key={n.id} value={n.f_user?.id ?? -1}>
                  <Avatar>
                    <AvatarImage src={n.f_user?.user_metadata?.avatar_url} alt="img" />
                    <AvatarFallback>guest</AvatarFallback>
                  </Avatar>
                  <span>{n.f_user?.user_metadata?.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {detail.granary_user_sum.map((n) => {
              console.log(n.userId)
              const detailList = detail.granary_detail.filter(m => m.userId === n.userId);
              return (
                <TabsContent key={n.id} value={n.f_user?.id ?? -1}
                  className="flex flex-1 min-h-0 flex-col">
                  <div className="mt-1 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-4 shadow-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium tracking-wide text-sky-700">
                        小计
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-semibold leading-none text-slate-900">
                          {n.total}
                        </span>
                        <span className="text-sm text-slate-500">
                          (wjpy)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-500">
                      <span>项目</span>
                      <span className="text-right">金额</span>
                      <span className="text-right">币种</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {detailList.map((detailItem) => (
                        <div
                          key={detailItem.id}
                          className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
                        >
                          <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                            {detailItem.granary_user_template?.name}
                          </span>

                          <span className="text-right text-sm font-semibold text-slate-900 tabular-nums">
                            {Number(detailItem.price).toLocaleString()}
                          </span>

                          <span className="text-right text-sm text-slate-500 uppercase">
                            {detailItem.granary_user_template?.cashType}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </DrawerContent>
      </Drawer>}

    </>
  );
}

export default GranaryDetail;