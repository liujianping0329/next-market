"use client";

import {
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import ky from "ky";



import ActionButton from "@/components/ActionButton";
import FormLocation from "../form/FormLocation"
import {
  Pencil,
  Trash2,
} from "lucide-react";


const LocationItems = ({ userInfo }) => {
  const [list, setList] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false)

  const [formVersion, setFormVersion] = useState(0);
  const [updateTarget, setUpdateTarget] = useState(null)

  const fetchList = async () => {
    const response = await ky.post('/api/location/list/match', {
      json: {
        planetId: userInfo.planet.id,
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
    await ky.post('/api/location/delete', {
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
          <FormLocation trigger={
            <Button size="sm" variant="outline">新增</Button>
          } onSuccess={() => {
            fetchList();
          }} userInfo={userInfo} />
        </div>
      </div>
      <div id="cardContainer" className="flex flex-col p-4 gap-3">
        {list.map(item => {
          return (
            <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">

              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 truncate text-base font-semibold text-gray-900">
                    {item.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                  <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20">经度lat:</span>
                <span className="w-10">{item.lat}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20">经度lng:</span>
                <span className="w-10">{item.lng}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20">半径:</span>
                <span className="w-10">{item.radius}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20">支出联想:</span>
                <span className="">{item.spendNames}</span>
              </div>

            </div>
          )
        })}
      </div>

      <FormLocation openLocationCtrl={openUpdate} setOpenLocationCtrl={setOpenUpdate}
        onSuccess={() => fetchList()} defaultValues={updateTarget}
        key={`${updateTarget?.id ?? "-1"}-${formVersion}`} />
    </>
  )
}

export default LocationItems;