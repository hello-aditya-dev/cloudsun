import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="font-serif text-6xl text-muted-foreground/40">404</div>
      <h2 className="mt-2 font-serif text-xl">Page not found</h2>
      <p className="mt-1 text-sm text-muted-foreground">This route doesn&apos;t exist in the CloudSun demo.</p>
      <Link href="/app" className="mt-4"><Button>Back to dashboard</Button></Link>
    </div>
  );
}
