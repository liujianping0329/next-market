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
import { ArrowLeft, MessageSquarePlus, Pencil, Trash2, Orbit, Link as LinkIcon, ChevronRight } from "lucide-react";

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

  const updateHandle = async (item) => {
    setUpdateTarget(item);
    setFormVersion((v) => v + 1)
    setOpenUpdate(true);
  }

  const deleteHandle = async (item) => {
    if (!confirm("确认删除？")) return
    await ky.post('/api/granary/granary_user_template/delete', {
      json: {
        id: item.id
      }
    }).json();
    fetchList();
  }

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
      <div id="cardContainer" className="flex flex-col p-4 gap-3">
        {list.map(item => {
          return (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={`/location/${item.cashType}.png`}
                  alt={item.name}
                  className={`h-full w-full object-cover`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 line-clamp-1 text-base font-semibold text-gray-900">
                    {item.name}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                    <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} />
                  </div>
                </div>

                <div className="mt-2 line-clamp-1 text-gray-500 flex gap-2">
                  <span>币种:   {item.cashType}  </span>
                  <span>默认值:   {item.dfValue}  </span>
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