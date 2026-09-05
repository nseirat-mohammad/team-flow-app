"use client";

import { createMessageSchema, CreateMessageType } from '@/app/schemas/message'
import { Field, FieldError } from '@/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import MessageComposer from './message-composer';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toastError, toastSuccess } from '@/components/shared/toast';
import { useEffect, useState } from 'react';
import { useAttachmentImage } from '@/lib/hooks/attchImage/use-attach-Image';
import { Message } from '@/lib/generated/prisma/client';
import { KindeUser } from '@kinde-oss/kinde-auth-nextjs';
import { getAvatar } from '@/lib/helpers';
import { queryKey } from '@/lib/constant';


interface ImessageInputProps {
    channelId: string,
    currentUser: KindeUser<Record<string, unknown>>
}

type MessagePageProps = {items:Message[], nextCursor?:string};
type InfiniteMessagePageProps = InfiniteData<MessagePageProps>;


const MessageInput = ({channelId ,currentUser}:ImessageInputProps) => {
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
    //! implement optimistic UI:
    const createMessageMutation = useMutation(
        orpc.message.create.mutationOptions({
            onMutate: async ({ content,imageUrl }) =>{
                await queryClient.cancelQueries({
                    queryKey: queryKey(channelId)
                })

                //? create snapShot
                const previousMessages = queryClient.getQueryData<InfiniteMessagePageProps>(
                    queryKey(channelId)
                )
                const tempID = `optimistic-message-${crypto.randomUUID()}`

                //* create Optimistic UI Update:
                const optimisticMessage:Message = {
                    id:tempID ,
                    content,
                    channelId,
                    imageUrl: imageUrl ?? null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    authorId: currentUser?.id,
                    authorName: currentUser?.given_name ?? "Mohammad",
                    authorEmail: currentUser?.email!,
                    authorAvatar: getAvatar(currentUser?.picture, currentUser?.email!),
                }

                //! update the chashe by using setQueryData method:
                queryClient.setQueryData<InfiniteMessagePageProps>(
                    queryKey(channelId),
                    (existingData) =>{
                        if (!existingData){
                            return {
                                pages:[{
                                    items:[optimisticMessage],
                                    nextCursor: undefined
                                }],
                                pageParams: [undefined]
                            } satisfies InfiniteMessagePageProps
                        }
                        //! get the first Page:
                        const firstPage = existingData.pages[0] ?? {
                            items: [],
                            nextCursor: undefined
                        }

                        const updatedFirstPage :MessagePageProps = {
                            ...firstPage,
                            items:[optimisticMessage, ...firstPage.items]
                        }
                        return {
                            ...existingData,
                            pages: [updatedFirstPage, ...existingData.pages.slice(1)],
                        }
                    }
                )

                return {
                    previousMessages,
                    tempID
                }
            },

            onSuccess:(data,_variables,context) =>{
                queryClient.setQueryData<InfiniteMessagePageProps>(queryKey(channelId), 
                (existingData) => {
                    if(!existingData) return existingData

                    const updatedPages = existingData.pages.map((page) =>({

                        ...page,
                        items: page.items.map((item) => item.id === context.tempID ? {
                            ...data
                        } : item)
                    }));
                    return {
                        ...existingData,
                        pages: updatedPages,
                    }
                }
                )
                form.reset({channelId,content:""})
                upload.clearUrl()
                setEditorKey((prev) => prev + 1)
            },
            onError: (_err,_variables,context) => {
                if(context?.previousMessages){
                    queryClient.setQueryData(["message.list", channelId], context.previousMessages)
                }
                //! لو الخطأ جاي من فشل الـ validation بالسيرفر (zod issues)
                const issues = (_err as any)?.data?.issues as
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
                toastError({ title: "Error!", description: _err.message || "Something went wrong!" })
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




