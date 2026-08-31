import { CloudUpload } from "lucide-react"
import { DialogWrapper } from "../dialog-wrapper"
import { UploadDropzone } from "@/lib/upload-thing/uploadthing"
import { toastError, toastSuccess } from "../toast"

interface IImageUploadProps {
    triggerImageUpload: React.ReactNode
    open: boolean
    onOpenChange: (open: boolean) => void
    onUploadedUrl: (url: string) => void
}

const ImageUploadModal = ({ triggerImageUpload, open, onOpenChange, onUploadedUrl }: IImageUploadProps) => {
  return (
    <DialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      titleClassName="text-2xl"
      title="Attach Image"
      description="Upload your first image and share it with your team"
      dialogContentClassName="sm:max-w-[600px] bg-white dark:bg-zinc-900 border border-violet-500/20 dark:border-violet-400/20 shadow-xl"
      icon={<CloudUpload className="size-7 text-violet-600 dark:text-violet-400" />}
      iconClassName="bg-violet-500/15 dark:bg-violet-400/15"
      trigger={triggerImageUpload}
    >
      <div className="mt-2 rounded-xl border-2 border-dashed border-violet-500/30 dark:border-violet-400/30 bg-violet-500/5 dark:bg-violet-400/5 p-6">
        <UploadDropzone
          className="
          ut-uploading:opacity-90
          ut-ready:bg-transparent
          ut-ready:border-none
          ut-ready:text-foreground
          ut-uploading:bg-transparent
          ut-uploading:text-muted-foreground
          ut-uploaded:bg-transparent
          ut-uploaded:border-none
          ut-label:text-sm ut-label:font-medium ut-label:text-zinc-700 dark:ut-label:text-zinc-200
          ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground
          ut-button:rounded-md ut-button:px-4 ut-button:py-2
          ut-button:bg-violet-600 dark:ut-button:bg-violet-500
          ut-button:text-white
          !ut-button:cursor-pointer ut-button:font-medium
          [&_[data-ut-element=cancel-button]]:!ring-violet-500
          [&_[data-ut-element=cancel-button]]:!border-violet-500
          [&_*:focus-visible]:!ring-violet-500
          [&_*:focus]:!outline-violet-500
        "
          appearance={{
            container: "bg-transparent",
            label: "text-zinc-700 dark:text-zinc-200",
            allowedContent: "text-xs text-muted-foreground",
          }}
          endpoint={"imageUploader"}
          onClientUploadComplete={(res) => {
            const url = res[0].ufsUrl
            toastSuccess({
              title: "Upload Success",
              description: "Your image has been uploaded successfully",
              duration: 3000,
            })
            onUploadedUrl(url)
          }}
          onUploadError={(error) => {
            toastError({
              title: "Upload Failed",
              description: error.message,
              duration: 3000,
            })
          }}
        />
      </div>
    </DialogWrapper>
  )
}

export default ImageUploadModal
