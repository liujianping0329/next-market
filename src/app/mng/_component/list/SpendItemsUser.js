"use client";

import {
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import ky from "ky";



import ActionButton from "@/components/ActionButton";
import {
  Pencil,
  Trash2,
} from "lucide-react";
import FormSpendPersonal from "../form/FormSpendPersonal";
const cashList = [
  {
    label: "日元",
    value: "jpy"
  }, {
    label: "万日元",
    value: "wjpy"
  }, {
    label: "台币",
    value: "twd"
  }, {
    label: "人民币",
    value: "cny"
  }
]

const SpendItemsUser = ({ userInfo }) => {
  const [list, setList] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false)

  const [formVersion, setFormVersion] = useState(0);
  const [updateTarget, setUpdateTarget] = useState(null)
  const [cash, setCash] = useState(null);
  const [spendCate, setSpendCate] = useState(null);

  const fetchList = async () => {
    const response = await ky.post('/api/spend/fix/list/match', {
      json: {
        userId: userInfo.id,
        planetId: userInfo.planet?.id
      }
    }).json();
    setList(response.list);
    setSpendCate(response.spendCate);
  }
  const fetchCash = async () => {
    const response = await ky.get('/api/juhe/cash').json();
    setCash(response.cash)
  }

  useEffect(() => {
    fetchList();
    fetchCash();
  }, []);

  const updateHandle = async (item) => {
    setUpdateTarget(item);
    setFormVersion((v) => v + 1)
    setOpenUpdate(true);
  }

  const deleteHandle = async (item) => {
    if (!confirm("确认删除？")) return
    await ky.post('/api/spend/fix/delete', {
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
          <FormSpendPersonal trigger={
            <Button size="sm" variant="outline">新增</Button>
          } onSuccess={() => {
            fetchList();
          }} userInfo={userInfo} cash={cash} spendCate={spendCate} />
        </div>
      </div>
      <div id="cardContainer" className="flex flex-col p-4 gap-3">
        {list.map(item => {
          return (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={`/spend/fixItem/${item.constants.value}.png`}
                  alt={item.constants.label}
                  className={`h-full w-full object-cover`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 line-clamp-1 text-base font-semibold text-gray-900">
                    {item.title}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                    <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} />
                  </div>
                </div>

                <div className="flex flex-col mt-2">
                  <span className="text-xl text-red-500 flex gap-2 font-semibold">{item.cost} {cashList.find(c => c.value === item.cashType)?.label || item.cashType} </span>
                  <span className="text text-muted-foreground">({item.constants.label}) </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <FormSpendPersonal openSpendPersonalCtrl={openUpdate} setOpenSpendPersonalCtrl={setOpenUpdate}
        onSuccess={() => fetchList()} defaultValues={updateTarget} cash={cash} spendCate={spendCate}
        key={`${updateTarget?.id ?? "-1"}-${formVersion}`} />
    </>
  )
}

export default SpendItemsUser;