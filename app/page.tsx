import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 gap-4 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Button>Click me</Button>
      <ThemeToggle />
    </div>
  );
}
