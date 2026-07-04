"use client";
import {
    useEffect,
    useState,
} from "react";
import ky from "ky";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import FormHarvest from "@/app/money/garden/_component/form/FormHarvest";
import { decode } from "@/app/utils/base64";

const MoreOpMenu = ({ open, onOpenChange, target, onSuccess }) => {

    const [isDeleting, setIsDeleting] = useState(false);
    const [passCodeGarden, setPassCodeGarden] = useState(null);

    const handleDelete = async () => {
        if (!confirm("确认删除？")) return;
        setIsDeleting(true);
        await ky.post('/api/money/harvest/delete', {
            json: { id: target.harvest[0].id }
        }).json();
        onSuccess();
        setIsDeleting(false);
        onOpenChange(false)
    }

    useEffect(() => {
        if (open && !target.harvest.length) {
            toast.error("当前没有可操作的记录");
            onOpenChange(false);
        } else {
            const loadPassCode = async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        let passCodeObj = decode(text);
                        console.log(passCodeObj)
                        setPassCodeGarden(passCodeObj);
                    }
                } catch (e) {
                    setPassCodeGarden(null);
                }
            }
            loadPassCode();
        }
    }, [open, target]);

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[45dvh] flex flex-col px-4 pb-0">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl">更多操作</DrawerTitle>
                        <p className="text-sm text-muted-foreground">
                            同一时间段多条记录时，针对第一条
                        </p>
                    </DrawerHeader>
                    <div className="flex flex-col divide-y pt-2">
                        <FormHarvest trigger={
                            <Button variant="ghost" className="h-14 text-lg">
                                编辑
                            </Button>
                        } defaultValues={target?.harvest?.[0]} onSuccess={() => {
                            onOpenChange(false)
                            onSuccess();
                        }} />
                        {passCodeGarden && (
                            <Button
                                variant="ghost"
                                className="h-auto min-h-20 flex-col items-center justify-center gap-1 rounded-xl px-4 py-4"
                                onClick={async () => {
                                    await ky.post('/api/money/harvest/upsert', {
                                        json: {
                                            id: target?.harvest?.[0]?.id,
                                            gardenId: passCodeGarden.id,
                                            title: passCodeGarden.title,
                                        }
                                    }).json();
                                    onSuccess();
                                    onOpenChange(false)
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-medium">
                                        识别口令并关联
                                    </span>
                                    <span className="
                                      rounded-full
                                      border border-green-200
                                      bg-green-100
                                      px-2 py-0.5
                                      text-[11px]
                                      font-medium
                                      text-green-700
                                    ">
                                        已识别
                                    </span>
                                </div>

                                <span className="text-xs text-muted-foreground text-center">
                                    将关联到「{passCodeGarden.title}」
                                </span>
                            </Button>
                        )}
                        <Button variant="ghost" className="h-14 text-lg text-destructive"
                            onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Spinner />}删除
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer >
        </>
    );
}

export default MoreOpMenu;
