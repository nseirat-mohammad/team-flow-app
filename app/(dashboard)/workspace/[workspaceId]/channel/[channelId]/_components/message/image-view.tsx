import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"

interface IImageViewProps {
  stagedUrl: string
  onRemove: () => void
}

const ImageView = ({ stagedUrl, onRemove }: IImageViewProps) => {
  return (
        <div className="group relative inline-block size-16 shrink-0 overflow-visible rounded-md">
        {/* الصورة */}
        <div className="relative size-16 overflow-hidden rounded-md border border-violet-500/20 dark:border-violet-400/20">
            <Image
            src={stagedUrl}
            alt="Staged image"
            fill
            className="object-cover"
            />
        </div>

        <Button
            type="button"
            onClick={onRemove}
            aria-label="Remove image"
            className=" absolute -top-2 -right-4
          flex size-5 items-center justify-center
          rounded-md bg-red-500 text-white shadow-md
          opacity-0 translate-y-2
          transition-all duration-200 ease-out
          group-hover:opacity-100 group-hover:translate-y-0
          hover:bg-red-600
            "
        >
            <X className="size-3" strokeWidth={2.5} />
        </Button>
        </div>
  )
}

export default ImageView