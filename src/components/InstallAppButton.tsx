import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppButton({
  variant = "onBrand",
}: {
  variant?: "onBrand" | "outline" | "default";
}) {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };
    const installedHandler = () => {
      setDeferred(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  if (installed) return null;

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        onClick={async () => {
          if (deferred) {
            await deferred.prompt();
            await deferred.userChoice;
            setDeferred(null);
            return;
          }
          setHelpOpen(true);
        }}
      >
        <Download className="size-4" /> Instalar app
      </Button>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Instalar no tablet</DialogTitle>
            <DialogDescription>
              O navegador não ofereceu a instalação automática. Faça manualmente:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Android / Chrome:</strong> toque no menu ⋮ no
              canto superior direito e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".
            </p>
            <p>
              <strong className="text-foreground">iPad / Safari:</strong> toque no botão
              Compartilhar e escolha "Adicionar à Tela de Início".
            </p>
            <p>
              A instalação só funciona no endereço publicado (não na pré-visualização) e com o
              navegador atualizado.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
