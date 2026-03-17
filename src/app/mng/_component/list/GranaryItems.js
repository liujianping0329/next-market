"use client";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";
import FormGranaryItems from "../form/FormGranaryItems"

const GranaryItems = ({ userInfo }) => {
  const [list, setList] = useState([]);

  const [editVer, setEditVer] = useState(0);

  const fetchList = async () => {
    const response = await ky.post('/api/granary/granary_user_template/list/match', {
      json: {
        userId: userInfo.id
      }
    }).json();
    console.log(response);
    setList(response.list);
  }

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">

        <div className="flex items-center justify-between">
          <FormGranaryItems trigger={
            <Button size="sm" variant="outline">新增</Button>
          } onSuccess={() => {
            fetchList();
          }} />
        </div>
      </div>
      <div id="cardContainer" className="p-4 gap-2">
        {list.map(item => {
          let picPosition = "";
          switch (item.cashType) {
            case "cny":
              picPosition = "object-left-top";
              break;
            case "twd":
              picPosition = "object-right-top";
              break;
            case "wjpy":
              picPosition = "object-right-bottom";
              break;
            case "usd":
              picPosition = "object-left-bottom";
              break;
            default:
              picPosition = "object-center";
              break;
          }


          return (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src="/location.png"
                  alt={item.name}
                  className={`h-full w-full object-cover ${picPosition}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 line-clamp-1 text-base font-semibold text-gray-900">
                    {item.name}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">
                      编辑
                    </button>
                    <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50">
                      置顶
                    </button>
                    <button className="rounded-md border px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                      删除
                    </button>
                  </div>
                </div>

                <div className="mt-2 line-clamp-1 text-sm text-gray-500">
                  {item.dfValue}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default GranaryItems;