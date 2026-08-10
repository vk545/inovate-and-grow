import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Inbox, Lightbulb, LogOut, RefreshCw, ExternalLink } from "lucide-react";

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1JrYGFXR1si4JzEbuZ8vVkwmhOrizw2DAa4gkCRJJJX8/edit";

const STATUS: Record<string, string> = {
  nova: "Nova",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  arquivada: "Arquivada",
};

export const Route = createFileRoute("/_authenticated/rh")({
  head: () => ({
    meta: [
      { title: "Painel RH | Canal de Sugestões e Ideias" },
      {
        name: "description",
        content: "Acompanhe, classifique e responda às sugestões e ideias enviadas pelos colaboradores.",
      },
      { property: "og:title", content: "Painel RH | Canal de Sugestões e Ideias" },
      {
        property: "og:description",
        content: "Acompanhe e classifique as contribuições dos colaboradores.",
      },
    ],
  }),
  component: RhPanel,
});

type Submission = {
  id: string;
  kind: "sugestao" | "ideia";
  title: string | null;
  message: string;
  author_name: string | null;
  author_sector: string | null;
  author_email: string | null;
  status: "nova" | "em_analise" | "aprovada" | "arquivada";
  synced_to_sheet: boolean;
  created_at: string;
};

function RhPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"todos" | "sugestao" | "ideia">("todos");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setIsAdmin(false);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin");
      setIsAdmin((roles?.length ?? 0) > 0);
    });
  }, []);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["submissions"],
    enabled: isAdmin === true,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Submission[];
    },
  });

  const items = useMemo(
    () => (data ?? []).filter((item) => filter === "todos" || item.kind === filter),
    [data, filter],
  );

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("submissions")
      .update({ status: status as Submission["status"] })
      .eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar o status.");
      return;
    }
    toast.success("Status atualizado.");
    queryClient.invalidateQueries({ queryKey: ["submissions"] });
  }


  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isAdmin === false) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Acesso não autorizado</h1>
        <p className="max-w-md text-muted-foreground">
          Esta conta não tem permissão de RH/Admin. Entre com um dos e-mails autorizados da
          Dataponto.
        </p>
        <Button variant="outline" onClick={signOut}>
          Sair
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="bg-[image:var(--gradient-brand)] px-6 py-6 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Painel RH — Sugestões e Ideias</h1>
            <p className="text-sm opacity-90">Dataponto · Canal de escuta dos colaboradores</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="onBrand" size="sm" asChild>
              <a href={SHEET_URL} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> Planilha
              </a>
            </Button>
            <Button variant="onBrand" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> Atualizar
            </Button>
            <Button variant="onBrand" size="sm" onClick={signOut}>
              <LogOut className="size-4" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="sugestao">Caixinha Convencional</TabsTrigger>
            <TabsTrigger value="ideia">Banco de Ideias</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6 space-y-4">
          {(isLoading || isAdmin === null) && (
            <p className="text-muted-foreground">Carregando contribuições...</p>
          )}
          {!isLoading && items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              Nenhuma contribuição por aqui ainda.
            </p>
          )}
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${
                      item.kind === "sugestao"
                        ? "bg-primary/10 text-primary"
                        : "bg-accent/15 text-accent"
                    }`}
                  >
                    {item.kind === "sugestao" ? (
                      <Inbox className="size-5" />
                    ) : (
                      <Lightbulb className="size-5" />
                    )}
                  </span>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {item.title ||
                        (item.kind === "sugestao" ? "Sugestão de melhoria" : "Nova ideia")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString("pt-BR")} ·{" "}
                      {item.author_name || "Anônimo"}
                      {item.author_sector ? ` · ${item.author_sector}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!item.synced_to_sheet && <Badge variant="outline">Fora da planilha</Badge>}
                  <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {item.message}
              </p>
              {item.author_email && (
                <p className="mt-3 text-xs text-muted-foreground">Contato: {item.author_email}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
