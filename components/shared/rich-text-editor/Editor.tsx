'use client'

import { editorExtensions } from '@/lib/editor-extensions'
import { useEditor, EditorContent } from '@tiptap/react'
import { MenuBar } from './MenuBar'

interface IRichTextEditorProps{
    field: any
    sendButton: React.ReactNode,
    footerLeft?: React.ReactNode,
}

const RichTextEditor = ({ field, sendButton, footerLeft }: IRichTextEditorProps) => {
    const editor = useEditor({
        // Don't render immediately on the server to avoid SSR issues
        immediatelyRender: false,
        content:(() =>{
            if(!field?.value) return "";
            try{
                return JSON.parse(field?.value);
            }catch{
                return "";
            }
        })(),
        onUpdate: ({ editor }) =>{
            if(field?.onChange){
                field.onChange(JSON.stringify(editor.getJSON()))
            }
        },
        extensions: editorExtensions,
        editorProps:{
            attributes:{
                class: 'workspace-scroll max-w-none min-h-[150px] caret-primary focus:outline-none focus:ring-0 focus:shadow-none px-4 py-2 prose dark:prose-invert marker:!text-primary',
            }
        }
    })

    return (
        <div className='w-full relative rounded-lg border border-primary/50 overflow-hidden flex flex-col'>
            <MenuBar editor={editor}/>
            <EditorContent editor={editor} className='workspace-scroll max-h-[250px] overflow-y-auto' />

            <div className='flex items-center justify-between border-t border-border px-3 py-2 bg-card'>
                <div className='min-h-8 flex items-center'>{footerLeft}</div>
                <div className='shrink-0'>{sendButton}</div>
            </div>
        </div>
    )
}

export default RichTextEditor
