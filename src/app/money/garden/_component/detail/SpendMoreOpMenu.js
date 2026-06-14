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
import FormGranarySpend from "@/app/money/garden/_component/form/FormGranarySpend";
import { useGranaryStore } from "@/app/money/garden/_store/granaryStore";

const SpendMoreOpMenu = ({ open, onOpenChange, target, onSuccess }) => {

    const [isDeleting, setIsDeleting] = useState(false);
    const cashStore = useGranaryStore(state => state.cash);
    const spendCateStore = useGranaryStore(state => state.spendCate);

    const handleDelete = async () => {
        if (!confirm("确认删除？")) return;
        setIsDeleting(true);
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
                        <FormGranarySpend trigger={
                            <Button variant="ghost" className="h-14 text-lg">
                                编辑
                            </Button>
                        } defaultValues={target} onSuccess={() => {
                            onOpenChange(false)
                            onSuccess();
                        }} cash={cashStore} spendCate={spendCateStore} />
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
