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
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail"

const HarvestDetail = ({ open, onOpenChange, target, onSuccess }) => {

  useEffect(() => {
    if (open && !target.harvest.length) {
      toast.error("当前没有可显示的记录");
      onOpenChange(false);
    }
  }, [open, target]);
  console.log(target)

  return (
    <>
      {target?.harvest?.length > 0 && <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[80dvh] flex flex-col px-4 pb-0">
          <DrawerHeader>
            <DrawerTitle className="text-xl">详情</DrawerTitle>
          </DrawerHeader>
          <Tabs defaultValue={target.harvest[0].startTime.split(" ")[1]}
            className="flex flex-1 min-h-0 flex-col">
            <TabsList variant="line">
              {target.harvest.map((n, i) => (
                <TabsTrigger key={n.startTime.split(" ")[1]} value={n.startTime.split(" ")[1]}>{n.startTime.split(" ")[1]}</TabsTrigger>
              ))}
            </TabsList>

            {target.harvest.map((n) => {
              const time = n.startTime.split(" ")[1];
              return (
                <TabsContent key={time} value={time}
                  className="flex flex-1 min-h-0 flex-col">
                  <div className="mt-4 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-medium leading-7 text-slate-800">
                          {n?.title || "未填写说明"}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {!n.pushId && (<div className="mt-3 flex items-center gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-red-700 shadow-sm">
                              提醒未设置成功
                            </span>
                          </div>)}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="rounded-full bg-white px-3 py-1 text-xs text-sky-700 shadow-sm">
                              提前 {n?.remindBefore ?? 0} 分钟提醒
                            </span>
                          </div>
                        </div>
                      </div>

                      {n?.f_user?.raw_user_meta_data?.avatar_url && (
                        <img
                          src={n.f_user.raw_user_meta_data.avatar_url}
                          alt=""
                          className="mt-0.5 size-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                  {n.gardenId && (
                    <div className="mt-4 flex-1 min-h-0 overflow-y-auto rounded-xl">
                      <GreengrassDetail id={n.gardenId} showToolbar={false} showRemarkbar={false}
                        cssTips={{
                          ImageCarousel: {
                            ratio: 16 / 9
                          }
                        }} />
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </DrawerContent>
      </Drawer>}

    </>
  );
}

export default HarvestDetail;