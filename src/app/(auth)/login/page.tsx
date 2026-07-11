import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/cloudsun/shared/Logo";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex h-14 items-center px-5">
        <Link href="/"><Wordmark className="!text-base" /></Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <Card className="border-border bg-card shadow-lift">
            <CardContent className="space-y-4 p-6">
              <div>
                <h1 className="font-serif text-2xl">Sign in</h1>
                <p className="mt-1 text-sm text-muted-foreground">Authentication is in demonstration mode. No real account is created.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input type="email" placeholder="you@example.com" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Password</Label>
                  <Input type="password" placeholder="••••••••" className="mt-1" />
                </div>
              </div>
              <Link href="/app" className="block">
                <Button className="w-full gap-1.5">Sign in (demo) <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <div className="rounded-lg border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-3 text-[11px] text-muted-foreground">
                Demo mode: clicking &ldquo;Sign in&rdquo; enters the demo workspace without verifying credentials. Configure NextAuth in production.
              </div>
              <div className="flex justify-between text-xs">
                <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
                <Link href="/signup" className="text-[oklch(0.62_0.16_42)] hover:underline">Create account</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
