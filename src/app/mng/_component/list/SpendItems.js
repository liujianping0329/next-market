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
import FormSpendItems from "../form/FormSpendItems"
import { ArrowLeft, SquarePen, Pencil, Trash2, Orbit, Link as LinkIcon, ChevronRight } from "lucide-react";
import FormSpendPersonal from "../form/FormSpendPersonal";

const SpendItems = ({ userInfo }) => {
  const [list, setList] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openUpdatePersonal, setOpenUpdatePersonal] = useState(false)

  const [formVersion, setFormVersion] = useState(0);
  const [updateTarget, setUpdateTarget] = useState(null)

  const fetchList = async () => {
    const response = await ky.post('/api/constants/list/match', {
      json: {
        ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id }),
        category: "spendCate"
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

  const updatePersonalHandle = async (item) => {
    setUpdateTarget(item);
    setFormVersion((v) => v + 1)
    setOpenUpdatePersonal(true);
  }

  const deleteHandle = async (item) => {
    if (!confirm("确认删除？")) return
    await ky.post('/api/constants/delete', {
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
          <FormSpendItems trigger={
            <Button size="sm" variant="outline">新增</Button>
          } onSuccess={() => {
            fetchList();
          }} userInfo={userInfo} />
        </div>
      </div>
      <div id="cardContainer" className="flex flex-col p-4 gap-3">
        {list.map(item => {
          return (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={`/spend/fixOnly${item.children?.isFixOnly}.png`}
                  alt={item.label}
                  className={`h-full w-full object-cover`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 line-clamp-1 text-base font-semibold text-gray-900">
                    {item.label}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                    <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} />
                  </div>
                </div>



                <div className="mt-2 line-clamp-1 text-gray-500 flex flex-col gap-2">
                  <span>是否只是固定费用:   {item.children?.isFixOnly === "1" ? "是" : "否"}  </span>
                  <div className="flex w-full items-center gap-2 rounded-md bg-sky-100 ">
                    <span className="ml-2">我的费用:</span>
                    <span className="text-sm font-medium text-sky-700 ring-1 ring-sky-100">
                      {item.children?.dfValue}
                    </span>

                    <div className="ml-auto mr-2">
                      <ActionButton
                        icon={SquarePen}
                        onClick={() => updatePersonalHandle(item)}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>

      <FormSpendItems openSpendCtrl={openUpdate} setOpenSpendCtrl={setOpenUpdate}
        onSuccess={() => fetchList()} defaultValues={updateTarget}
        key={`${updateTarget?.id ?? "-1"}-${formVersion}`} />
      <FormSpendPersonal openSpendPersonalCtrl={openUpdatePersonal} setOpenSpendPersonalCtrl={setOpenUpdatePersonal}
        onSuccess={() => fetchList()} defaultValues={updateTarget}
        key={`${updateTarget?.id ?? "-1"}-${formVersion}-personal`} />
    </>
  )
}

export default SpendItems;