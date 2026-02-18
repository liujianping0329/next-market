"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Info, Pencil, Trash2, Share2, ArrowLeft } from "lucide-react"

const GreengrassDetail = ({ id }) => {
  return (
    <>
      <div id="toolBar" className="flex p-2.5 justify-between overflow-x-auto items-center border-b">
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">返回</span>
            </span>
          </Button>
        </div>
        <div className="flex space-x-2 items-center">
          <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <Info className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">附属信息</span>
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <Pencil className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">修改</span>
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <Trash2 className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">删除</span>
            </span>
          </Button>

          <Button variant="ghost" size="sm" className="h-auto px-2 py-2">
            <span className="flex flex-col items-center gap-1">
              <Share2 className="h-5 w-5" />
              <span className="text-[11px] leading-none text-muted-foreground">分享</span>
            </span>
          </Button>
        </div>
      </div >
      <p>
        绿草记录是一个专门用来记录和管理种草信息的工具。它可以帮助用户记录各种与种草相关的信息，如种草的内容、时间、地点、心情等。通过绿草记录，用户可以更好地回顾和总结自己的种草经历，发现其中的规律和趋势，从而更好地规划和管理自己的种草活动。
      </p>
    </>
  );
}
export default GreengrassDetail;