const SPREADSHEET_ID = "1JrYGFXR1si4JzEbuZ8vVkwmhOrizw2DAa4gkCRJJJX8";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

export type SubmissionRow = {
  kind: "sugestao" | "ideia";
  title: string | null;
  message: string;
  author_name: string | null;
  author_sector: string | null;
  author_email: string | null;
  created_at: string;
};

export function kindLabel(kind: SubmissionRow["kind"]) {
  return kind === "sugestao" ? "Caixinha de Sugestão" : "Programa Banco de Ideias";
}

/** Appends one submission to the company Google Sheet. Never throws. */
export async function appendToSheet(row: SubmissionRow): Promise<boolean> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const sheetsKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lovableKey || !sheetsKey) {
    console.error("Google Sheets connector env vars missing");
    return false;
  }

  const values = [
    [
      new Date(row.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      kindLabel(row.kind),
      row.title ?? "",
      row.message,
      row.author_name ?? "Anônimo",
      row.author_sector ?? "",
      row.author_email ?? "",
    ],
  ];

  try {
    const res = await fetch(
      `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/A:G:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": sheetsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      },
    );
    if (!res.ok) {
      console.error(`Sheets append failed [${res.status}]: ${await res.text()}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Sheets append error", error);
    return false;
  }
}
