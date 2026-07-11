import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-8 text-center">
      <div className="font-serif text-6xl text-muted-foreground/40">404</div>
      <h1 className="mt-2 font-serif text-2xl">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">This route doesn&apos;t exist in the CloudSun demo.</p>
      <Link href="/" className="mt-4"><Button>Back to home</Button></Link>
    </div>
  );
}
