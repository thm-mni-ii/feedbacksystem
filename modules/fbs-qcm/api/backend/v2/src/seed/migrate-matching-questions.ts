/**
 * Einmaliges Migrations-Werkzeug: repariert Matching-Fragen, die mit der
 * alten, fehlerhaften Konvertierung in MongoDB gelandet sind.
 *
 * Hintergrund: Ein älterer Daten-Import/Speicherstand legte Matching-Fragen
 * mit `questionType: "matching"` (Legacy-String, lowercase) UND einer
 * Choice-Konfiguration (`answerColumns`/`optionRows`) statt der für
 * Matching-Fragen erforderlichen Struktur (`categories`/`items`, siehe
 * web/src/model/questionTypes/Matching.ts) in der Datenbank ab. Dadurch
 * konnte web/src/components/algorithm-lab/AlgorithmLabQuestion.vue beim
 * Auswerten der Antwort (`scoreMatching()`) nicht auf `items` zugreifen.
 *
 * Dieses Script sucht genau solche Dokumente (questionType "matching",
 * fehlende categories/items, aber vorhandene answerColumns/optionRows) und
 * konvertiert sie 1:1 nach dem gleichen Schema, das
 * web/src/composables/competencyGraph.mock.ts für Matching-Fragen verwendet:
 * answerColumns -> categories, optionRows -> items (correctCategoryId aus
 * correctAnswers[0]). Der questionType wird dabei auf das kanonische Enum
 * "Matching" normalisiert.
 *
 * Nutzung (aus api/backend/v2/):
 *   npx tsx --env-file=.env src/seed/migrate-matching-questions.ts
 *   # Nur anzeigen, was geändert würde, ohne zu schreiben:
 *   npx tsx --env-file=.env src/seed/migrate-matching-questions.ts --dry-run
 */
import { connect, disconnect } from "../mongo/mongo";

interface LegacyAnswerColumn {
  id: number | string;
  name: string;
}

interface LegacyOptionRow {
  id: number | string;
  text: string;
  correctAnswers?: Array<number | string>;
}

interface LegacyMatchingConfiguration extends Record<string, unknown> {
  answerColumns?: LegacyAnswerColumn[];
  optionRows?: LegacyOptionRow[];
  categories?: unknown;
  items?: unknown;
}

function isLegacyMatchingConfiguration(
  config: Record<string, unknown> | undefined
): config is LegacyMatchingConfiguration {
  if (!config) return false;
  const hasProperShape = Array.isArray(config.categories) && Array.isArray(config.items);
  const hasLegacyShape = Array.isArray(config.answerColumns) && Array.isArray(config.optionRows);
  return !hasProperShape && hasLegacyShape;
}

function toMatchingConfiguration(config: LegacyMatchingConfiguration) {
  return {
    categories: (config.answerColumns ?? []).map((column) => ({
      id: String(column.id),
      label: column.name
    })),
    items: (config.optionRows ?? []).map((row) => ({
      id: String(row.id),
      text: row.text,
      correctCategoryId: String(row.correctAnswers?.[0] ?? "")
    }))
  };
}

async function migrate() {
  const dryRun = process.argv.includes("--dry-run");
  const db = await connect();
  const collection = db.collection("question");

  const candidates = await collection
    .find({ questionType: { $in: ["matching", "Matching"] } })
    .toArray();

  let fixed = 0;
  for (const doc of candidates) {
    const config = doc.questionConfiguration as Record<string, unknown> | undefined;
    if (!isLegacyMatchingConfiguration(config)) continue;

    const newConfiguration = toMatchingConfiguration(config as LegacyMatchingConfiguration);
    console.log(
      `${dryRun ? "[dry-run] würde reparieren" : "Repariere"}: ${doc._id} (${doc.text ?? "<kein Text>"}) – ` +
        `${newConfiguration.categories.length} Kategorien, ${newConfiguration.items.length} Elemente`
    );

    if (!dryRun) {
      await collection.updateOne(
        { _id: doc._id },
        { $set: { questionType: "Matching", questionConfiguration: newConfiguration } }
      );
    }
    fixed += 1;
  }

  console.log(
    `${dryRun ? "Gefunden" : "Migration abgeschlossen"}: ${fixed} von ${candidates.length} Matching-Frage(n) betroffen.`
  );
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnect();
  });
