"use client";

import {
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import ky from "ky";



import ActionButton from "@/components/ActionButton";
import FormQuestion from "../form/FormQuestion"
import {
  Pencil,
  Trash2,
} from "lucide-react";

const QuestionItems = ({ userInfo }) => {
  const [list, setList] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false)

  const [formVersion, setFormVersion] = useState(0);
  const [updateTarget, setUpdateTarget] = useState(null)

  const fetchList = async () => {
    const response = await ky.post('/api/ai_question/list/match', {
      json: {}
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
    await ky.post('/api/ai_question/delete', {
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
          <FormQuestion trigger={
            <Button size="sm" variant="outline">新增</Button>
          } onSuccess={() => {
            fetchList();
          }} />
        </div>
      </div>
      <div id="cardContainer" className="flex flex-col p-4 gap-3">
        {list.map(item => {
          return (
            <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 line-clamp-1 text-base font-semibold text-gray-900">
                  {item.title}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <ActionButton icon={Pencil} onClick={() => updateHandle(item)} />
                  <ActionButton icon={Trash2} onClick={() => deleteHandle(item)} />
                </div>
              </div>

              <div className="mt-2 line-clamp-1 text-gray-500 flex gap-2 justify-between ">
                <span>token:   {item.token}  </span>
                <span>创建于:   {item.answer_update_at?.slice(0, 10)}  </span>
              </div>
            </div>
          )
        })}
      </div>

      <FormQuestion openCtrl={openUpdate} setOpenCtrl={setOpenUpdate}
        onSuccess={() => fetchList()} defaultValues={updateTarget}
        key={`${updateTarget?.id ?? "-1"}-${formVersion}`} />
    </>
  )
}

export default QuestionItems;