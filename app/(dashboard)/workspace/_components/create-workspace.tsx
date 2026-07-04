"use client"
import { DialogWrapper } from '@/components/shared/dialog-wrapper'
import { ArrowRight, Layers, Plus, X } from 'lucide-react'
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
import { workspaceSchema } from '@/app/schemas/workspace'

export const CreateWorkspace = () => {
    const [open, onOpenChange] = useState(false)
    //! 1-define the form (in React Hook Form):
    const form = useForm({
        resolver: zodResolver(workspaceSchema),
        defaultValues: {
            name: ""
        }
    })

    //! 2- define the submit handler:
    const onSubmit = () => {
        console.log("OnSubmit")
    }

    return (
        <>
            <div className="h-px w-full mx-auto mb-2 bg-primary/80" />
            <DialogWrapper
                open={open} tooltipContent='Create Workspace' tooltipSide='left'
                title="Create Workspace"
                description='create new workspace to get started.'
                dialogContentClassName='sm:max-w-[600px] bg-background border border-primary/50'
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
                                    className="bg-input border border-border focus-visible:ring-2 focus-visible:ring-primary/50 placeholder:text-xs"
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                    <div className='flex items-center space-x-4 mt-5'>
                        <Button size={"lg"} className='active:scale-90 bg-primary/30 hover:bg-primary/50 ring-2 ring-offset-0 ring-primary  transition-all duration-300' type='submit'>
                            Create Workspace
                            <ArrowRight className="size-4" />
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
