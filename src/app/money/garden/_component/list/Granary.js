import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import FormSoy from "../form/FormSoy";
import { Button } from "@/components/ui/button";
import ky from "ky";
import { Check } from "lucide-react";
import { Loader2 } from "lucide-react";
import { pickColor } from "@/app/utils/color";
import ActionButton from "@/components/ActionButton";
import FolderOpBar from "./soy/FolderOpBar";
import FormGranary from "@/app/money/garden/_component/form/FormGranary";

const Granary = ({ userInfo }) => {
    const [cash, setCash] = useState(null);
    const [userTemplate, setUserTemplate] = useState(null);

    const fetchCash = async () => {
        const response = await ky.get('/api/juhe/cash').json();
        setCash(response.cash)
    }
    const fetchData = async () => {
        const response = await ky.post('/api/granary/granary_user_template/list/match',
            { json: { ...(userInfo?.planet ? { planetId: userInfo.planet.id } : { userId: userInfo?.id }) } }
        ).json();
        setUserTemplate(response.list)
    }

    useEffect(() => {
        fetchCash();
        fetchData();
    }, []);

    return (
        <>
            <div id="toolBar" className="mx-2.5 mt-2 flex items-center justify-between rounded-md border bg-muted/40 px-2.5 py-2">
                <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">
                        记下每一笔来去与积累，在春种夏耘、秋收冬藏的日子里，慢慢收成属于自己的丰盈。
                    </span>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <FormGranary trigger={
                                <Button size="sm" variant="outline">记录余额</Button>
                            } onSuccess={() => {
                                //fetchList();
                            }} cash={cash} userTemplate={userTemplate} />

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
                </div>
            </div>
        </>
    );
}

export default Granary;