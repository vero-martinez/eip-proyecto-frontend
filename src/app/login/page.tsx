import { LoginBrandPanel } from "@/features/auth/components/login-brand-panel"
import { LoginForm } from "@/features/auth/components/login-form"

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/40 p-4 sm:p-6">
      <div className="relative grid w-full max-w-6xl overflow-hidden rounded-2xl bg-card shadow-2xl shadow-primary/10 ring-1 ring-border lg:grid-cols-2 lg:min-h-[min(660px,calc(100dvh-4rem))]">
        <LoginBrandPanel />
        <section className="flex items-center justify-center bg-card p-6 sm:p-18">
          <LoginForm />
        </section>
      </div>
    </main>
  )
}