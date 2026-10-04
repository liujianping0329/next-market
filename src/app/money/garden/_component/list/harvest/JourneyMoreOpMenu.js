"use client";

import { useState } from "react";
import ky from "ky";
import { toast } from "sonner";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import FormHarvestJourney from "@/app/money/garden/_component/form/FormHarvestJourney";

const JourneyMoreOpMenu = ({ open, onOpenChange, target, onSuccess }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("确认删除这条旅程记录及其待办事项吗？")) return;
        setIsDeleting(true);
        try {
            await ky.post("/api/money/harvest/deleteWithItems", {
                json: { harvestId: target.harvest.id },
            }).json();
            onOpenChange(false);
            onSuccess();
        } catch {
            toast.error("删除旅程记录失败");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[40dvh] flex flex-col px-4 pb-0">
                <DrawerHeader>
                    <DrawerTitle className="text-xl">旅程记录操作</DrawerTitle>
                </DrawerHeader>
                <div className="flex flex-col divide-y pt-2">
                    <FormHarvestJourney
                        key={`journey-edit-${target?.harvest?.id ?? "empty"}`}
                        trigger={<Button variant="ghost" className="h-14 text-lg">修改</Button>}
                        defaultValues={target?.harvest}
                        onSuccess={() => {
                            onOpenChange(false);
                            onSuccess();
                        }}
                    />
                    <Button variant="ghost" className="h-14 text-lg text-destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting && <Spinner />}删除
                    </Button>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default JourneyMoreOpMenu;
