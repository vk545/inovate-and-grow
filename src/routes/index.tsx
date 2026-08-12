import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitSuggestion } from "@/lib/submissions.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import logoDataConnect from "@/assets/logo-dataconnect.png.asset.json";
import logoInovaData from "@/assets/logo-inovadata.png.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Canal de Sugestões e Ideias | Dataponto" },
      {
        name: "description",
        content:
          "Terminal para colaboradores enviarem sugestões de melhoria e ideias inovadoras para o crescimento da empresa.",
      },
      { property: "og:title", content: "Canal de Sugestões e Ideias | Dataponto" },
      {
        property: "og:description",
        content: "Envie suas sugestões de melhoria e grandes ideias. Sua voz constrói a empresa.",
      },
    ],
  }),
  component: Kiosk,
});

type Kind = "sugestao" | "ideia";
type Step = "escolha" | "formulario" | "sucesso";

const CONFIG = {
  sugestao: {
    titulo: "Caixinha Convencional",
    subtitulo: "Envie feedbacks",
    descricao: "Conte o que podemos melhorar no dia a dia. Se preferir, envie de forma anônima.",
    logo: logoDataConnect.url,
    alt: "Logo DataConnect",
    classe: "bg-primary text-primary-foreground",
  },
  ideia: {
    titulo: "Programa Banco de Ideias",
    subtitulo: "Compartilhe suas inovações e grandes projetos",
    descricao: "Ideias e projetos precisam de identificação para que o RH possa dar retorno.",
    logo: logoInovaData.url,
    alt: "Logo InovaData",
    classe: "bg-accent text-accent-foreground",
  },
} as const;


function Kiosk() {
  const [step, setStep] = useState<Step>("escolha");
  const [kind, setKind] = useState<Kind>("sugestao");
  const [form, setForm] = useState({
    title: "",
    message: "",
    author_name: "",
    author_sector: "",
    author_email: "",
  });
  const [loading, setLoading] = useState(false);
  const send = useServerFn(submitSuggestion);

  function reset() {
    setForm({ title: "", message: "", author_name: "", author_sector: "", author_email: "" });
    setStep("escolha");
  }

  function open(next: Kind) {
    setKind(next);
    setStep("formulario");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (form.message.trim().length < 5) {
      toast.error("Escreva um pouco mais sobre a sua contribuição.");
      return;
    }
    if (kind === "ideia" && !form.author_name.trim()) {
      toast.error("Informe seu nome para enviar uma ideia.");
      return;
    }
    setLoading(true);
    try {
      await send({ data: { kind, ...form } });
      setStep("sucesso");
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-[image:var(--gradient-brand)] px-6 py-4 text-center text-primary-foreground">
        <h1 className="text-lg font-extrabold uppercase tracking-[0.18em] sm:text-xl">
          Canal de Sugestões e Ideias
        </h1>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-8">
        {step === "escolha" && (
          <section className="text-center">
            <h2 className="text-2xl font-extrabold uppercase leading-tight text-foreground sm:text-3xl">
              Bem-vindo!
              <br />
              Como você quer contribuir hoje?
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {(Object.keys(CONFIG) as Kind[]).map((key) => {
                const item = CONFIG[key];
                const Icon = item.icone;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => open(key)}
                    className={`group flex flex-col items-center gap-4 rounded-[2rem] px-6 py-10 text-center shadow-[var(--shadow-panel)] transition-transform duration-200 active:scale-[0.98] sm:hover:-translate-y-1 ${item.classe}`}
                  >
                    <span className="flex size-24 items-center justify-center rounded-3xl bg-white/15">
                      <Icon className="size-12" strokeWidth={1.6} />
                    </span>
                    <span className="text-lg font-extrabold uppercase leading-tight">
                      {item.titulo}
                    </span>
                    <span className="text-sm opacity-90">{item.subtitulo}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-10 text-sm text-muted-foreground">
              Sua participação é fundamental para o nosso crescimento!
            </p>
          </section>
        )}

        {step === "formulario" && (
          <section>
            <button
              type="button"
              onClick={() => setStep("escolha")}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Voltar
            </button>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-muted/40 p-1.5">
              {(Object.keys(CONFIG) as Kind[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setKind(key)}
                  aria-pressed={kind === key}
                  className={`rounded-xl px-3 py-2.5 text-xs font-bold uppercase leading-tight transition-colors sm:text-sm ${
                    kind === key
                      ? key === "sugestao"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {CONFIG[key].titulo}
                </button>
              ))}
            </div>


            <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <h2 className="text-xl font-extrabold uppercase text-foreground">
                {CONFIG[kind].titulo}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{CONFIG[kind].descricao}</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Título (opcional)</Label>
                  <Input
                    id="title"
                    maxLength={120}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Resuma em poucas palavras"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    {kind === "sugestao"
                      ? "O que você quer melhorar?"
                      : "Descreva sua ideia ou projeto"}
                  </Label>
                  <Textarea
                    id="message"
                    required
                    maxLength={4000}
                    rows={7}
                    className="text-base"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Escreva aqui com suas palavras..."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="author_name">
                      Nome {kind === "ideia" ? "(obrigatório)" : "(opcional)"}
                    </Label>
                    <Input
                      id="author_name"
                      maxLength={100}
                      required={kind === "ideia"}
                      value={form.author_name}
                      onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                      placeholder={kind === "ideia" ? "Seu nome completo" : "Pode deixar em branco"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author_sector">
                      Setor {kind === "ideia" ? "(obrigatório)" : "(opcional)"}
                    </Label>
                    <Input
                      id="author_sector"
                      maxLength={100}
                      required={kind === "ideia"}
                      value={form.author_sector}
                      onChange={(e) => setForm({ ...form, author_sector: e.target.value })}
                      placeholder="Ex.: Produção, Comercial"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author_email">E-mail para retorno (opcional)</Label>
                  <Input
                    id="author_email"
                    type="email"
                    maxLength={255}
                    value={form.author_email}
                    onChange={(e) => setForm({ ...form, author_email: e.target.value })}
                    placeholder="voce@dataponto.com.br"
                  />
                </div>

                <Button
                  type="submit"
                  variant={kind === "sugestao" ? "brand" : "brandAccent"}
                  size="xl"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar contribuição"}
                </Button>
              </form>
            </div>
          </section>
        )}

        {step === "sucesso" && (
          <section className="flex flex-col items-center gap-5 text-center">
            <span className="flex size-24 items-center justify-center rounded-full bg-accent/15 text-accent">
              <CheckCircle2 className="size-14" strokeWidth={1.6} />
            </span>
            <h2 className="text-2xl font-extrabold uppercase text-foreground">Obrigado!</h2>
            <p className="max-w-md text-muted-foreground">
              Sua contribuição foi enviada para o RH e registrada com segurança. Juntos fazemos a
              empresa crescer.
            </p>
            <Button variant="brand" size="xl" onClick={reset}>
              Enviar outra contribuição
            </Button>
          </section>
        )}
      </main>

      <footer className="flex items-center justify-between gap-4 border-t border-border px-6 py-3">
        <div className="h-1.5 w-full max-w-xs rounded-full bg-[image:var(--gradient-brand)]" />
        <Link
          to="/auth"
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Lock className="size-3.5" /> Acesso RH
        </Link>
      </footer>
    </div>
  );
}
