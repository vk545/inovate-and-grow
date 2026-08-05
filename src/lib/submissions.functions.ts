import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { appendToSheet } from "./submissions.server";

const submissionSchema = z.object({
  kind: z.enum(["sugestao", "ideia"]),
  title: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().min(5).max(4000),
  author_name: z.string().trim().max(100).optional().nullable(),
  author_sector: z.string().trim().max(100).optional().nullable(),
  author_email: z.string().trim().max(255).optional().nullable(),
});

export const submitSuggestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.kind === "ideia" && !data.author_name) {
      throw new Error("Identificação obrigatória para o Banco de Ideias.");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
      { auth: { persistSession: false } },
    );

    const createdAt = new Date().toISOString();
    const record = {
      kind: data.kind,
      title: data.title || null,
      message: data.message,
      author_name: data.author_name || null,
      author_sector: data.author_sector || null,
      author_email: data.author_email || null,
      created_at: createdAt,
    };

    const synced = await appendToSheet(record);

    const { error } = await supabase
      .from("submissions")
      .insert({ ...record, synced_to_sheet: synced });

    if (error) {
      console.error("Insert failed", error.message);
      throw new Error("Não foi possível registrar sua contribuição. Tente novamente.");
    }

    return { ok: true, synced };
  });
