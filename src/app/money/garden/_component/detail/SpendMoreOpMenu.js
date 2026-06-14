"use client";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import ky from "ky";
import {
    useState
} from "react";

const SpendMoreOpMenu = ({ open, onOpenChange, target, onSuccess }) => {

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("确认删除？")) return;
        setIsDeleting(true);
        console.log(target);
        await ky.post('/api/spend/delete', {
            json: { id: target.id }
        }).json();
        onSuccess();
        setIsDeleting(false);
        onOpenChange(false)
    }

    return (
        <>
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="h-[45dvh] flex flex-col px-4 pb-0">
                    <DrawerHeader>
                        <DrawerTitle className="text-xl">更多操作</DrawerTitle>
                    </DrawerHeader>
                    <div className="flex flex-col divide-y pt-2">
                        {/* <FormHarvest trigger={
                            <Button variant="ghost" className="h-14 text-lg">
                                编辑
                            </Button>
                        } defaultValues={target?.harvest?.[0]} onSuccess={() => {
                            onOpenChange(false)
                            onSuccess();
                        }} /> */}
                        <Button variant="ghost" className="h-14 text-lg text-destructive"
                            onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Spinner />}删除
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default SpendMoreOpMenu;
