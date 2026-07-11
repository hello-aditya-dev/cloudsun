import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wordmark } from "@/components/cloudsun/shared/Logo";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
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
                <h1 className="font-serif text-2xl">Reset password</h1>
                <p className="mt-1 text-sm text-muted-foreground">Password reset is not configured in demo mode. Enter your email to see what the flow would look like.</p>
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" placeholder="you@example.com" className="mt-1" />
              </div>
              <Button className="w-full">Send reset link (demo)</Button>
              <div className="rounded-lg border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-3 text-[11px] text-muted-foreground">
                No email will actually be sent. Configure an email provider in production.
              </div>
              <Link href="/login" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
