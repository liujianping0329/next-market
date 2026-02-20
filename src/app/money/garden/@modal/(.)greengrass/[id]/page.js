"use client";
import GreengrassDetail from "@/app/money/garden/greengrass/_component/detail/GreengrassDetail"
import { useRouter, useParams } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

export function GreengrassModal({ }) {
  const router = useRouter()
  const params = useParams();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="w-screen h-screen
          max-w-none
          rounded-none
          p-0
          flex flex-col
          [&>button.absolute]:hidden">
        <VisuallyHidden>
          <DialogTitle>Greengrass Detail</DialogTitle>
        </VisuallyHidden>

        <div className="flex-1 overflow-y-auto">
          <GreengrassDetail id={params.id} showToolbar={true} />
        </div>

      </DialogContent>
    </Dialog>
  )
}
export default GreengrassModal;