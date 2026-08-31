"use client";

import { createMessageSchema, CreateMessageType } from '@/app/schemas/message'
import { Field, FieldError } from '@/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import MessageComposer from './message-composer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toastError, toastSuccess } from '@/components/shared/toast';
import { useEffect, useState } from 'react';
import { useAttachmentImage } from '@/lib/hooks/attchImage/use-attach-Image';


interface ImessageInputProps {
    channelId: string
}

const MessageInput = ({channelId }:ImessageInputProps) => {
    const queryClient = useQueryClient()
    const [editorKey, setEditorKey] = useState(0)
    const upload = useAttachmentImage()

    const form = useForm({
        resolver: zodResolver(createMessageSchema),
        defaultValues:{
            channelId: channelId,
            content: "",
        }
    })

    useEffect(() => {
        form.setValue("imageUrl", upload.stagedUrl ?? undefined, {
            shouldValidate: !!form.formState.errors.content, // Re-validate immediately if there was an error before
        })
    }, [upload.stagedUrl])


    //* create mutation to mutate the orpc:
    const createMessageMutation = useMutation(
        orpc.message.create.mutationOptions({
            onSuccess:() =>{
                queryClient.invalidateQueries({
                    queryKey: orpc.message.list.key({ input:{ channelId }})
                })
                form.reset({channelId,content:""})
                upload.clearUrl()
                setEditorKey((prev) => prev + 1)
                toastSuccess({ title: "success!", description: "Message created successfully!" })
            },
            onError: (error) => {
                //! لو الخطأ جاي من فشل الـ validation بالسيرفر (zod issues)
                const issues = (error as any)?.data?.issues as
                    | { path: (string | number)[]; message: string }[]
                    | undefined

                if (issues?.length) {
                    //! نطلع توست برسائل كل الأخطاء مجمّعة
                    toastError({
                        title: "Input validation failed",
                        description: issues.map((i) => i.message).join(" • "),
                    })
                    return
                }
                toastError({ title: "Error!", description: error.message || "Something went wrong!" })
            },
        }))

    //! Handle form submission (create new Message)
    const onSubmit = (data:CreateMessageType) =>{
           const trimmedContent = data.content.trim()
        const hasImage = !!upload.stagedUrl

        //! لازم يكون فيه نص فعلي (مو مسافات بس) أو صورة، وإلا نمنع الإرسال ونطلع توست
        if (!trimmedContent && !hasImage) {
            toastError({
                title: "Empty message",
                description: "Please write a message or attach an image before sending.",
            })
            return
        }
        createMessageMutation.mutate({
            ...data,
            imageUrl: upload.stagedUrl ?? undefined
        })
    }

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                    name="content"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <MessageComposer key={editorKey} upload={upload} value={field.value} onChange={field.onChange} onSubmit={() =>onSubmit(form.getValues())} isPending={createMessageMutation.isPending} />
                            {fieldState.invalid && ( <FieldError errors={[fieldState.error]} /> )}
                        </Field>
                    )}
                    />
            </form>
        </>
    )
}

export default MessageInput




