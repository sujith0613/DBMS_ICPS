import * as React from "react"
import { X } from "lucide-react"
import { Button } from "./button"

export const Dialog = ({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
       <div className="bg-background rounded-lg shadow-lg relative max-w-4xl w-full max-h-[90vh] flex flex-col">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
          {children}
       </div>
    </div>
  )
}
