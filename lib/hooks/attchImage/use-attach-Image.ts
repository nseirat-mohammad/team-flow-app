"use client"

import { useCallback, useMemo, useState } from "react"

export const useAttachmentImage = () =>{
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [stagedUrl, setStagedUrl] = useState<string | null>(null)
    const [isUploading,setIsUploading] = useState<boolean>(false)

    const uploadedUrl = useCallback((url: string) =>{
        setStagedUrl(url)
        setIsUploading(false)
        setIsOpen(false)
    },[])
    //! Function to clear the url:
    const clearUrl = useCallback(() =>{
        setStagedUrl(null)
        setIsUploading(false)
    },[])

    return useMemo(() =>({
        isOpen,
        setIsOpen,
        uploadedUrl,
        stagedUrl,
        isUploading,
        clearUrl
    }),[isOpen, setIsOpen, uploadedUrl, stagedUrl, isUploading,clearUrl]);
}


export type UseAttachmentImageType = ReturnType<typeof useAttachmentImage>
