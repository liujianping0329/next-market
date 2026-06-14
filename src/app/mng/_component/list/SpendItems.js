"use client";

import {
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import ky from "ky";



import ActionButton from "@/components/ActionButton";
import FormSpendItems from "../form/FormSpendItems"
import {
  Pencil,
  Trash2,
} from "lucide-react";


const SpendItems = ({ userInfo }) => {
  const [list, setList] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false)

  const [formVersion, setFormVersion] = useState(0);
  const [updateTarget, setUpdateTarget] = useState(null)

  const fetchList = async () => {
    const response = await ky.post('/api/constants/list/match', {
      json: {
        ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id }),
        category: "spendCate"
      }
    }).json();
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
                  src={`/spend/fixItem/${item.value}.png`}
                  alt={item.label}
                  className={`h-full w-full object-cover`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: item.children?.bgColor || "#94A3B8",
                      }}
                    />

                    <span className="min-w-0 truncate text-base font-semibold text-gray-900">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                    <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} />
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
    </>
  )
}

export default SpendItems;