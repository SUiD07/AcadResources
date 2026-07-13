// supabase/functions/classify-document/index.ts
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";
import { classifyDocument, type StudentDocument, type KeywordConfig } from "../_shared/classify.ts";

export default {
  fetch: withSupabase({ auth: ["secret"] }, async (req, ctx) => {
    // This function is only called server-to-server (by a DB webhook),
    // so we only allow the secret auth mode — never publishable.
    const body = await req.json();

    // Database webhooks send payloads shaped like:
    // { type: "INSERT" | "UPDATE", table: "student_documents", record: {...}, old_record: {...} }
    const record: StudentDocument | undefined = body.record;

    if (!record) {
      return Response.json({ error: "Missing record in payload" }, { status: 400 });
    }

    // Respect manual admin overrides — don't touch block/doc_type/board_exam
    if (record.is_overridden) {
      const { error } = await ctx.supabaseAdmin
        .from("student_documents")
        .update({ classified_at: new Date().toISOString() })
        .eq("id", record.id);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
      return Response.json({ skipped: "is_overridden" });
    }

    const { data: configs, error: configError } = await ctx.supabaseAdmin
      .from("keyword_configs")
      .select("*");

    if (configError) {
      return Response.json({ error: configError.message }, { status: 500 });
    }

    const typedConfigs = (configs ?? []) as KeywordConfig[];

    const blockConfig = classifyDocument(record, typedConfigs, "block_mapping");
    const typeConfig = classifyDocument(record, typedConfigs, "doc_type");
    const boardConfig = classifyDocument(record, typedConfigs, "board_exam");

    const updates = {
      block: blockConfig?.label ?? "Unclassified",
      doc_type: typeConfig?.label ?? "Unknown",
      board_exam: boardConfig?.label ?? null,
      classified_at: new Date().toISOString(),
    };

    const { error: updateError } = await ctx.supabaseAdmin
      .from("student_documents")
      .update(updates)
      .eq("id", record.id);

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 500 });
    }

    return Response.json({ success: true, id: record.id, ...updates });
  }),
};

/* To invoke locally:

  1. Run `supabase start`
  2. Trigger via a fake webhook payload:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/classify-document' \
    --header 'Content-Type: application/json' \
    --header 'apiKey: <your local secret key>' \
    --data '{"type":"INSERT","table":"student_documents","record":{"id":1,"title":"Anatomy Lecture 1","folder_path":"Block 1 > Anatomy","is_overridden":false}}'

*/