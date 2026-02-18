import GreengrassDetail from "../../_component/detail/GreengrassDetail";
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export async function GreengrassModal({ params }) {
  const router = useRouter()
  return (
    <Dialog open onOpenChange={(open) => {
      if (!open) router.back()
    }}
    >
      <DialogContent className="max-w-3xl">
        <GreengrassDetail id={params.id} />
      </DialogContent>
    </Dialog>
  )
}
export default GreengrassModal;