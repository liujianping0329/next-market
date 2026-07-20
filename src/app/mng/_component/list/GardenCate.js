"use client";

import {
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import ky from "ky";



import ActionButton from "@/components/ActionButton";
import FormGardenCate from "../form/FormGardenCate"
import {
  Pencil,
  Trash2,
  CircleFadingPlus,
  MonitorDown,
  EraserIcon,
  FileDown,
  MonitorUp,
  Search
} from "lucide-react";
import FormGardenCateExport from "../form/FormGardenCateExport";
import FormGardenCateImport from "../form/FormGardenCateImport";
import FormGardenResearch from "../form/FormGardenResearch";
import { toast } from "sonner";

const GardenCate = ({ userInfo }) => {
  const [list, setList] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false)
  const [openAddChild, setOpenAddChild] = useState(false)
  const [openExport, setOpenExport] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [openResearch, setOpenResearch] = useState(false)
  const [isObjDeleted, setIsObjDeleted] = useState(false)

  const [formVersion, setFormVersion] = useState(0);
  const [updateTarget, setUpdateTarget] = useState(null)
  const [addChildTarget, setAddChildTarget] = useState(null)
  const [exportTarget, setExportTarget] = useState(null)
  const [importTarget, setImportTarget] = useState(null)

  const [researchTarget, setResearchTarget] = useState(null)

  const fetchList = async () => {
    const response = await ky.post('/api/garden_cate/list/matchWithChildren', {
      json: {
        planetId: userInfo.planet.id,
        status: 1
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
    await ky.post('/api/garden_cate/upsert', {
      json: {
        id: item.id,
        status: -1
      }
    }).json();
    fetchList();
  }

  return (
    <>
      <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">

        <div className="flex items-center justify-between">
          <FormGardenCate trigger={
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
              <div className="grid shrink-0 grid-cols-3 gap-2 pb-1">
                <Button size="sm" variant="outline" onClick={() => {
                  setAddChildTarget(item);
                  setFormVersion((v) => v + 1);
                  setOpenAddChild(true);
                }} >
                  <CircleFadingPlus className="h-4 w-4 text-sky-500" />
                  <span>批量新增子项</span>
                </Button>
                <Button size="sm" variant="outline"
                  onClick={async () => {
                    const text = (item.children ?? [])
                      .map((child) => {
                        const lines = [child.name];

                        if (child.children?.length) {
                          lines.push(
                            ` ${child.children
                              .map((grandchild) => grandchild.name)
                              .join(" ")}`
                          );
                        }

                        return lines.join("\n");
                      })
                      .join("\n");

                    await navigator.clipboard.writeText(text);
                    toast.success("类目文本已复制到剪贴板");
                  }}
                >
                  <FileDown className="h-4 w-4 text-sky-500" />
                  <span>导出类目文本</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  if (!confirm("确认物理删除该类目下的所有子项？")) return
                  setIsObjDeleted(true);
                  ky.post('/api/garden_cate/delete/allChildren', {
                    json: {
                      id: item.id
                    }
                  }).then(() => {
                    fetchList();
                    setIsObjDeleted(false);
                  });
                }} disabled={isObjDeleted} >
                  <EraserIcon className="h-4 w-4 text-sky-500" />
                  <span>物理重置子项</span>
                </Button>

                <Button size="sm" variant="outline" onClick={() => {
                  setExportTarget(item);
                  setFormVersion((v) => v + 1);
                  setOpenExport(true);
                }} >
                  <MonitorDown className="h-4 w-4 text-sky-500" />
                  <span>导出AI提示词</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setImportTarget(item);
                  setFormVersion((v) => v + 1);
                  setOpenImport(true);
                }} >
                  <MonitorUp className="h-4 w-4 text-sky-500" />
                  <span>导入AI结果</span>
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setResearchTarget(item);
                  setFormVersion((v) => v + 1);
                  setOpenResearch(true);
                }} >
                  <Search className="h-4 w-4 text-sky-500" />
                  <span>探索&发现</span>
                </Button>
              </div>

              {item.children?.map((child) => (
                <div
                  key={child.id}
                  className="overflow-hidden rounded-lg border border-gray-200"
                >
                  {/* 二级标题栏 */}
                  <div className="flex items-center justify-between gap-2 bg-slate-100 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-white">

                      </span>

                      <span className="min-w-0 truncate text-sm font-semibold text-gray-900">
                        {child.name}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <ActionButton
                        icon={Pencil}
                        onClick={() => updateHandle(child)}
                      />
                      <ActionButton
                        icon={Trash2}
                        onClick={() => deleteHandle(child)}
                      />
                    </div>
                  </div>

                  {/* 三级区域 */}
                  {child.children?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2">
                      {child.children.map((grandchild) => (
                        <div
                          key={grandchild.id}
                          className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5"
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />

                            <span className="min-w-0 truncate text-xs text-gray-700">
                              {grandchild.name}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-0.5">
                            <ActionButton
                              icon={Pencil}
                              onClick={() => updateHandle(grandchild)}
                            />
                            <ActionButton
                              icon={Trash2}
                              onClick={() => deleteHandle(grandchild)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            </div>
          )
        })}
      </div>

      <FormGardenCate openGardenCateCtrl={openUpdate} setOpenGardenCateCtrl={setOpenUpdate}
        onSuccess={() => fetchList()} defaultValues={updateTarget}
        key={`${updateTarget?.id ?? "-1"}-${formVersion}`} />
      <FormGardenCate openGardenCateCtrl={openAddChild} setOpenGardenCateCtrl={setOpenAddChild}
        onSuccess={() => fetchList()} isAddChild={true} defaultValues={addChildTarget}
        key={`${addChildTarget?.id ?? "-1"}-${formVersion}-addChild`} />
      <FormGardenCateExport openCtrl={openExport} setOpenCtrl={setOpenExport}
        onSuccess={() => { }} defaultValues={exportTarget}
        key={`${exportTarget?.id ?? "-1"}-${formVersion}-export`} />
      <FormGardenCateImport openCtrl={openImport} setOpenCtrl={setOpenImport}
        onSuccess={() => { fetchList(); }} defaultValues={importTarget}
        key={`${importTarget?.id ?? "-1"}-${formVersion}-import`} />
      <FormGardenResearch openCtrl={openResearch} setOpenCtrl={setOpenResearch}
        onSuccess={() => { fetchList(); }} defaultValues={researchTarget}
        key={`${researchTarget?.id ?? "-1"}-${formVersion}-research`} />
    </>
  )
}

export default GardenCate;