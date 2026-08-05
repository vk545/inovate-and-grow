import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso RH | Canal de Sugestões e Ideias" },
      {
        name: "description",
        content: "Área restrita do RH para acompanhar sugestões e ideias enviadas pelos colaboradores.",
      },
      { property: "og:title", content: "Acesso RH | Canal de Sugestões e Ideias" },
      {
        property: "og:description",
        content: "Área restrita do RH para acompanhar sugestões e ideias dos colaboradores.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/rh", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/rh` },
        });
        if (error) throw error;
        toast.success("Conta criada. Confirme o e-mail para acessar o painel.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/rh", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[image:var(--gradient-brand)] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-[var(--shadow-panel)]">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h1 className="text-lg font-bold text-foreground">Painel RH / Admin</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito à equipe autorizada</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail corporativo</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rh-dataponto@dataponto.com.br"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="brand" size="lg" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar acesso"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Primeiro acesso? Criar conta do RH" : "Já tenho conta, quero entrar"}
        </button>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar ao terminal
        </Link>
      </div>
    </main>
  );
}
