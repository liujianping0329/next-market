"use client";
import { useEffect } from "react";
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
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail"
import { formatDateLocal } from "@/app/utils/date";
import {
  Hotel,
  Airplane,
  Notes
} from "@icon-park/react";

const JourneyDetail = ({ open, onOpenChange, target, onSuccess }) => {

  useEffect(() => {
    if (open && !target.harvest) {
      toast.error("当前没有可显示的记录");
      onOpenChange(false);
    }
  }, [open, target]);
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
              <div className="mt-4 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-4 shadow-sm">
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
