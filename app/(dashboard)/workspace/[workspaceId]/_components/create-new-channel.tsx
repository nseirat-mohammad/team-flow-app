/* eslint-disable react-hooks/incompatible-library */
"use client"
import { useState } from 'react'
import { DialogWrapper } from '@/components/shared/dialog-wrapper'
import { ArrowRight, Hash, Loader, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { channelSchema, ChannelSchemaType } from '@/app/schemas/channel'
import { transformChannelName } from '@/lib/helpers'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { toastError, toastSuccess, toastWarning } from '@/components/shared/toast'
import { isDefinedError } from '@orpc/client'

const CreateNewChannel = () => {
    const [open, onOpenChange] = useState(false)
    const queryClient = useQueryClient()
    //! 1-define the form (in React Hook Form):
    const form = useForm({
        resolver: zodResolver(channelSchema),
        defaultValues: {
            channelName: ""
        }
    })
    //! track the input valus in updated or not by using watch method in form:
    const watechedChannelName = form.watch("channelName")
    const transformedChannelName = watechedChannelName ? transformChannelName(watechedChannelName) : ""


    //! 2-define the mutation:
    const createNewChannelMutation = useMutation(
        orpc.channel.create.mutationOptions({
            onSuccess: (data) => {
                toastSuccess({
                    title: "Success",
                    description: `Channel "${data.name}" created successfully.`
                })

                //* invalidate Query: (get the data after create the new channel )
                queryClient.invalidateQueries({
                    queryKey: orpc.channel.list.queryKey()
                })

                form.reset()
                onOpenChange(false)
            },
            onError: (error) => {
                if (isDefinedError(error)) {
                    toastWarning({
                        title: "Warning",
                        description: `Failed to create channel. ${error.message}`
                    })
                }
                else {
                    toastError({
                        title: "Error",
                        description: `Failed to create channel. Try again Later!`
                    })
                }

                form.reset()

            }
        })
    )


    //! 3-define the onSubmit function uding the mutation:
    const onSubmit = (values: ChannelSchemaType) => {
        createNewChannelMutation.mutate(values)
    }

    //! 4-define the cancel handler:
    const onCancel = () => {
        form.reset()
        onOpenChange(false)
    }

    return (
        <>
            <DialogWrapper open={open} onOpenChange={onOpenChange}
                trigger={
                    <Button
                        className="relative inline-flex h-10 w-full active:scale-95 transition overflow-hidden rounded-lg p-[1px] focus:outline-none">
                        <span
                            className="absolute inset-[-1000%] animate-[spin_3.2s_cubic-bezier(0.22,1,0.36,1)_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ef4444_0%,#f97316_12.5%,#fbbf24_25%,#22c55e_37.5%,#2dd4bf_50%,#3b82f6_62.5%,#a855f7_75%,#ec4899_87.5%,#ef4444_100%)]">
                        </span>
                        <span
                            className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-zinc-100 dark:bg-background px-7 text-sm font-medium text-foreground backdrop-blur-3xl gap-2"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            Create New Channel
                        </span>
                    </Button>
                }
                title="Create New Channel"
                description="Add a new channel so your team has a dedicated space to talk."
                dialogContentClassName='sm:max-w-[600px] bg-background border border-primary/90'
                icon={<Hash className='size-7 text-muted-foreground' />}
                iconClassName='border border-primary'

            >
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                        name="channelName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="channel">
                                    channel name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="channel"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Write your channel name..."
                                    autoComplete="off"
                                    className="bg-input border border-primary/30 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary placeholder:text-xs"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>

                        )}
                    />
                    {transformedChannelName && transformedChannelName !== watechedChannelName && (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/80 bg-zinc-100 dark:bg-background px-3 py-1.5">
                            <span className="relative flex size-2 shrink-0">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
                            </span>
                            <span className="text-xs text-muted-foreground">
                                will be created as {" "} :
                            </span>
                            <code className="font-mono text-sm font-medium text-foreground">
                                {transformedChannelName}
                            </code>
                        </div>
                    )}
                    <div className='flex items-center space-x-4 mt-5'>
                        <Button disabled={createNewChannelMutation.isPending} size={"lg"} className='active:scale-90 bg-primary/40 hover:bg-primary/50 ring-2 ring-offset-0 ring-primary  transition-all duration-300' type='submit'>
                            {
                                createNewChannelMutation.isPending ? (
                                    <div className='flex items-center gap-2 italic'>
                                        <span>Creating...</span>
                                        <Loader className="w-5 h-5 animate-spin text-amber-600" />
                                    </div>
                                ) : (
                                    <>
                                        Create Channel
                                        <ArrowRight className="size-4" />
                                    </>
                                )
                            }
                        </Button>
                        <Button onClick={onCancel} size={"lg"} type='button' className='active:scale-90 bg-destructive/30 hover:bg-destructive/50       ring-2 ring-offset-0 ring-destructive/30 transition-all duration-300'>
                            Cancel
                            <X className="size-4" />
                        </Button>
                    </div>
                </form>
            </DialogWrapper>


        </>
    )
}

export default CreateNewChannel