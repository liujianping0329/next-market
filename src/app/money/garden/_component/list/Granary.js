import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import FormSoy from "../form/FormSoy";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2, ChevronRight } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";
import FolderOpBar from "./soy/FolderOpBar";
import FormGranary from "@/app/money/garden/_component/form/FormGranary";
import GranaryDetail from "@/app/money/garden/_component/detail/GranaryDetail";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Granary = ({ userInfo }) => {
    const [cash, setCash] = useState(null);
    const [userTemplate, setUserTemplate] = useState(null);
    const [granaryList, setGranaryList] = useState([]);
    const [targetItemDetail, setTargetItemDetail] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [detailVersion, setDetailVersion] = useState(0);
    const [planetUsers, setPlanetUsers] = useState([]);

    const fetchCash = async () => {
        const response = await ky.get('/api/juhe/cash').json();
        setCash(response.cash)
    }
    const fetchData = async () => {
        const response = await ky.post('/api/granary/listAll',
            {
                json: {
                    ...(userInfo?.planet ? { planetId: userInfo.planet.id } : {}),
                    ...(userInfo ? { userId: userInfo.id } : {})
                }
            }
        ).json();
        console.log(response)
        setUserTemplate(response.templateList)
        setGranaryList(response.granaryList)
        setPlanetUsers(response.planetUsers ?? [])
    }

    useEffect(() => {
        fetchCash();
        fetchData();
    }, []);

    const handleDetail = (item) => {
        setTargetItemDetail(item);
        setDetailVersion(v => v + 1);
        setOpenDetail(true);
    }

    return (
        <>
            <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        记下每一笔来去与积累，在春种夏耘、秋收冬藏的日子里，慢慢收成属于自己的丰盈。
                    </span>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            {userTemplate && <FormGranary trigger={
                                <Button size="sm" variant="outline">记录余额</Button>
                            } onSuccess={() => {
                                fetchData();
                            }} cash={cash} userTemplate={userTemplate} />}

                            {/* <FormSoy trigger={ */}
                            <Button size="sm" variant="outline">记录关键交易</Button>
                            {/* } onSuccess={() => {
                                fetchList();
                            }} /> */}
                        </div>
                        <div className="flex items-center">
                            {/* <FormSoy trigger={ */}
                            <Button size="sm" variant="outline">图表</Button>
                            {/* } onSuccess={() => {
                                fetchList();
                            }} /> */}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                        <div className="flex flex-wrap gap-2">
                            {planetUsers.map((user) => {
                                const name = user?.raw_user_meta_data?.name;
                                const avatar = user?.raw_user_meta_data?.avatar_url;

                                return (
                                    <div
                                        key={user.userId || user.id || name}
                                        className="flex items-center gap-2 rounded-full bg-slate-50 px-2.5 py-1.5"
                                    >
                                        <Avatar className="h-8 w-8 border border-slate-200">
                                            <AvatarImage src={avatar} alt={name} />
                                            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-slate-700">{name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div id="cardContainer" className="flex flex-col p-4 gap-3">
                {granaryList.map(item => {
                    return (
                        <div key={item.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 transition hover:shadow-md">
                            <div className="flex flex-col h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={`/monthDog/${item.date.split("-")[1].padStart(2, '0')}.jpg`}
                                    alt={item.id}
                                    className={`h-24 w-24 object-cover`}
                                />
                                <div className="border-t border-gray-200" />
                                <span className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                                    {item.date}
                                </span>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                    <div className=" text-lg min-w-0 line-clamp-1 text-base font-semibold text-gray-900">
                                        {item.total}
                                    </div>
                                    <div className={`text-lg min-w-0 line-clamp-1 font-semibold ${item.diffToNext > 0
                                        ? "text-red-500"
                                        : item.diffToNext < 0
                                            ? "text-green-500"
                                            : "text-gray-900"
                                        }`}>
                                        {item.diffToNext != null ? item.diffToNext.toFixed(2) : "-"}
                                    </div>
                                </div>

                                <div className=" text-sm mt-6 line-clamp-1 text-gray-500 flex gap-0 flex flex-col">
                                    <span>对日元汇率</span>
                                    <span>cny:{item.cnyToJpy} twd:{item.twdToJpy} usd:{item.usdToJpy}</span>
                                </div>
                                <div className="flex gap-4 justify-end">
                                    <Button variant="outline" className="p-3" onClick={() => handleDetail(item)}>
                                        <span>详情</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <GranaryDetail open={openDetail} onOpenChange={setOpenDetail} target={targetItemDetail}
                key={`${targetItemDetail?.id ?? "empty"}-${detailVersion}`}
                onSuccess={() => {
                    fetchData();
                }} />
        </>
    );
}

export default Granary;
