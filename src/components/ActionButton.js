import { Button } from "@/components/ui/button"

const ActionButton = ({ icon: Icon, label, onClick, disabled }) => {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={disabled} className={`h-auto px-1 py-1.5`}>
      <span className="flex flex-col items-center gap-1">
        <Icon className="h-7 w-7" />
        {label && <span className="text-[11px] leading-none text-muted-foreground">
          {label}
        </span>}
      </span>
    </Button>
  )
}
export default ActionButton;