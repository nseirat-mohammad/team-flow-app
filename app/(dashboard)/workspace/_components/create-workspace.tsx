"use client"
import { DialogWrapper } from '@/components/shared/dialog-wrapper'
import { ArrowRight, Layers, Loader, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from "react-hook-form"
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { zodResolver } from "@hookform/resolvers/zod"
import { createWorkspaceSchemaType, workspaceSchema } from '@/app/schemas/workspace'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { toastError, toastSuccess, toastWarning } from '@/components/shared/toast'
import { isDefinedError } from '@orpc/client'

export const CreateWorkspace = () => {
    const [open, onOpenChange] = useState(false)
    const queryClient = useQueryClient()
    //! 1-define the form (in React Hook Form):
    const form = useForm({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: ""
        }
    })

    //*-- define mutation to create a new workspace:
    const createWorkspaceMutation = useMutation(
        orpc.workspace.create.mutationOptions({
            onSuccess: (newWorkspace) => {
                toastSuccess({
                    title: "Success!",
                    description: `Worksapce ${newWorkspace.workspaceName} created Succesfully!`
                })
                queryClient.invalidateQueries({
                    queryKey: orpc.workspace.list.queryKey()
                })
                form.reset();
                onOpenChange(false); //* close thee dialog.
            },
            onError: (error) => {
                if (isDefinedError(error)) {
                    if (error.code === "RATE_LIMITED") {
                        toastWarning({
                            title: "Warning!",
                            description: error.message || "You have reached the maximum number of workspaces allowed. Please try again later."
                        })
                        return;
                    }
                    if (error.code === "FORBIDDEN") {
                        toastWarning({
                            title: "Warning!",
                            description: error.message || "You are not allowed to create a new workspace."
                        })
                        return;
                    }
                    toastError({
                        title: "Error!",
                        description: error.message
                    })
                    return;
                }
                toastError({
                    title: "Error!",
                    description: error.message || "Failed to create new Workspace, Please try again later!"
                })
                form.reset()
            }
        })
    )

    //! 2- define the submit handler:
    const onSubmit = (values: createWorkspaceSchemaType) => {
        createWorkspaceMutation.mutate(values)
    }

    return (
        <>
            <div className="h-px w-full mx-auto mb-2 bg-primary/80" />
            <DialogWrapper
                open={open} tooltipContent='Create Workspace' tooltipSide='left'
                title="Create Workspace"
                description='create new workspace to get started.'
                dialogContentClassName='sm:max-w-[600px] bg-background border border-primary/90'
                icon={<Layers className='size-7 text-muted-foreground' />}
                iconClassName='border border-primary'
                onOpenChange={onOpenChange} iconOnly trigger={
                    <button className=" relative cursor-pointer size-14 rounded-xl focus:outline-none active:scale-95 transition-transform">
                        <svg
                            className="absolute inset-0 size-full animate-spin-slow"
                            viewBox="0 0 56 56"
                        >
                            <rect
                                x="1.5"
                                y="1.5"
                                width="53"
                                height="53"
                                rx="10"
                                fill="none"
                                strokeWidth="2"
                                strokeDasharray="6 5"
                                strokeLinecap="round"
                                stroke="url(#rainbow-gradient)"
                            />
                            <defs>
                                <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-chart-1)" />
                                    <stop offset="25%" stopColor="var(--color-chart-2)" />
                                    <stop offset="50%" stopColor="var(--color-chart-3)" />
                                    <stop offset="75%" stopColor="var(--color-chart-4)" />
                                    <stop offset="100%" stopColor="var(--color-chart-5)" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="absolute inset-[2px] flex items-center justify-center rounded-[9px] bg-background shadow-raised">
                            <Plus className="size-5" />
                        </span>
                    </button>
                }>
                {/* Build the form */}
                <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="workspace">
                                    workspace name
                                </FieldLabel>
                                <Input
                                    {...field}
                                    id="worksapce"
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Write your workspace"
                                    autoComplete="off"
                                    className="bg-input border border-primary/30 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-primary placeholder:text-xs"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <div className='flex items-center space-x-4 mt-5'>
                        <Button disabled={createWorkspaceMutation.isPending} size={"lg"} className='active:scale-90 bg-primary/30 hover:bg-primary/50 ring-2 ring-offset-0 ring-primary  transition-all duration-300' type='submit'>
                            {
                                createWorkspaceMutation.isPending ? (
                                    <div className='flex items-center gap-2 italic'>
                                        <span>Creating...</span>
                                        <Loader className="w-5 h-5 animate-spin text-amber-600" />
                                    </div>
                                ) : (
                                    <>
                                        Create Workspace
                                        <ArrowRight className="size-4" />
                                    </>
                                )
                            }
                        </Button>
                        <Button onClick={(e) => {
                            e.preventDefault()
                            form.reset()
                            onOpenChange(false);
                        }} size={"lg"} type='button' className='active:scale-90 bg-destructive/30 hover:bg-destructive/50 ring-2 ring-offset-0 ring-destructive/30 transition-all duration-300'>
                            Cancel
                            <X className="size-4" />
                        </Button>
                    </div>
                </form>
            </DialogWrapper>
        </>
    )
}


/*
======================================
Tell React Query the workspace list is now outdated (stale),
so it refetches fresh data automatically — no manual state update needed.
======================================
*/
