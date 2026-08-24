import { Editor, useEditorState } from "@tiptap/react"
import TooltipWrapper from "../tooltip-wrapper";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Code2, Italic, List, ListOrdered, Redo2, Strikethrough, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface IMenuBarProps {
    editor: Editor | null
}
interface IToolbarItem {
    name: string;
    label: string;
    icon: React.ElementType;
    isActive?: (editor: Editor) => boolean; // اختياري لأن undo/redo مش toggle
    isDisabled?: (editor: Editor) => boolean;
    action: (editor: Editor) => void;
}
// كل عنصر هنا = زر واحد في التولبار، أضف أي عنصر جديد وهيشتغل تلقائي
const toolbarItems: IToolbarItem[] = [
    {
        name: "bold",
        label: "Bold",
        icon: Bold,
        isActive: (editor) => editor.isActive("bold"),
        action: (editor) => editor.chain().focus().toggleBold().run(),
    },
    {
        name: "italic",
        label: "Italic",
        icon: Italic,
        isActive: (editor) => editor.isActive("italic"),
        action: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    {
        name: "strike",
        label: "Strike Through",
        icon: Strikethrough,
        isActive: (editor) => editor.isActive("strike"),
        action: (editor) => editor.chain().focus().toggleStrike().run(),
    },
    {
        name: "codeBlock",
        label: "Code Block",
        icon: Code2,
        isActive: (editor) => editor.isActive("codeBlock"),
        action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
];

const listItems: IToolbarItem[] = [
    {
        name: "bulletList",
        label: "Bullet List",
        icon: List,
        isActive: (editor) => editor.isActive("bulletList"),
        action: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        name: "orderedList",
        label: "Ordered List",
        icon: ListOrdered,
        isActive: (editor) => editor.isActive("orderedList"),
        action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
];

const historyItems: IToolbarItem[] = [
    {
        name: "undo",
        label: "Undo",
        icon: Undo2,
        isDisabled: (editor) => !editor.can().undo(),
        action: (editor) => editor.chain().focus().undo().run(),
    },
    {
        name: "redo",
        label: "Redo",
        icon: Redo2,
        isDisabled: (editor) => !editor.can().redo(),
        action: (editor) => editor.chain().focus().redo().run(),
    },
];



export const MenuBar = ({ editor }:IMenuBarProps) =>{
     const [clickedButton, setClickedButton] = useState<string | null>(null);
const editorState = useEditorState({
    editor,
    selector:({editor}) =>{
        if(!editor) return null;
        return {
            bold: editor?.isActive("bold"),
            italic: editor?.isActive("italic"),
            strike: editor?.isActive("strike"),
            codeBlock: editor?.isActive("codeBlock"),
            bulletList: editor?.isActive("bulletList"),
            orderedList: editor?.isActive("orderedList"),
            canUndo: editor?.can().undo(),
            canRedo: editor?.can().redo(),
        }
    }
})
    if(!editor) return null;

    return (
        <>
        <div className="border border-border border-x-0 border-t-0 rounded-t-lg p-2 bg-card flex flex-wrap items-center gap-1">
            <div className="flex flex-wrap gap-2 items-center">

                    {toolbarItems.map((item) => {
                        const Icon = item.icon;
                        const active = editorState?.[item.name as keyof typeof editorState] ?? false;
                        return (
                        <TooltipWrapper key={item.name} content={item.label} side="top">
                                <Toggle
                                    className={cn(
                                        "cursor-pointer",
                                        active && "!bg-primary/30"
                                    )}
                                    size={"sm"}
                                    pressed={active}
                                    onPressedChange={() => item.action(editor)}>
                                    <Icon className="h-4 w-4" />
                                </Toggle>
                            </TooltipWrapper>
                        );
                    })}
            </div>
            <div className="w-px h-6 bg-primary/30 mx-2"/>
            {/* List Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
                {listItems.map((item) => {
                    const Icon = item.icon;
                    const active = editorState?.[item.name as keyof typeof editorState] ?? false;
                    return (
                    <TooltipWrapper key={item.name} content={item.label} side="top">
                                <Toggle
                                    className={cn(
                                        "cursor-pointer",
                                        active && "!bg-primary/30"
                                    )}
                                    size={"sm"}
                                    pressed={active}
                                    onPressedChange={() => item.action(editor)}>
                                    <Icon className="h-4 w-4" />
                                </Toggle>
                            </TooltipWrapper>
                    );
                })}
            </div>
            <div className="w-px h-6 bg-primary/30 mx-2"/>
            {/* Undo and Radio Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
                {historyItems.map((item) => {
                    const Icon = item.icon;
                const disabled = item.name === "undo"
                            ? !editorState?.canUndo
                            : !editorState?.canRedo;
                    return (
                        <TooltipWrapper key={item.name} content={item.label} side="top">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        disabled ? "cursor-not-allowed" : "cursor-pointer"
                                    )}
                                    disabled={disabled}
                                    onClick={() => item.action(editor)}>
                                    <Icon className="h-4 w-4" />
                                </Button>
                            </TooltipWrapper>
                    );
                })}
            </div>

        </div>
        </>
    )
}