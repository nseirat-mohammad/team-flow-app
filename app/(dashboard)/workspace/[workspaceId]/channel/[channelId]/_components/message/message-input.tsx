"use client";

import { createMessageSchema, CreateMessageType } from '@/app/schemas/message'
import { Field, FieldError } from '@/components/ui/field';
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import MessageComposer from './message-composer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { toastSuccess } from '@/components/shared/toast';
import { useChannelId } from '@/lib/hooks/channels/use-channel-id';


interface ImessageInputProps {
    channelId: string
}

const MessageInput = ({channelId }:ImessageInputProps) => {
const queryClient = useQueryClient()

    const form = useForm({
        resolver: zodResolver(createMessageSchema),
        defaultValues:{
            channelId: channelId,
            content: "",
        }
    })


    //* create mutation to mutate the orpc:
    const createMessageMutation = useMutation(
        orpc.message.create.mutationOptions({
            onSuccess:() =>{
                queryClient.invalidateQueries({
                    queryKey: orpc.message.list.queryKey({ input: { channelId } })
                })
                toastSuccess({ title: "success!", description: "Message created successfully!" })
            },
            onError:() =>{
                toastSuccess({ title: "Error!", description: "Something went wrong!" })
            },
        })
    )

    //! Handle form submission (create new Message)
    const onSubmit = (data:CreateMessageType) =>{
        createMessageMutation.mutate(data)

    }

    return (
        <>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                    name="content"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <MessageComposer value={field.value} onChange={field.onChange} onSubmit={() =>onSubmit(form.getValues())} isPending={createMessageMutation.isPending} />
                            {fieldState.invalid && ( <FieldError errors={[fieldState.error]} /> )}
                        </Field>
                    )}
                    />
            </form>
        </>
    )
}

export default MessageInput




