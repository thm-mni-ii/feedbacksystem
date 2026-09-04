/**
 * Seed-Script: importiert die Frontend-Dummy-Daten (Fragen + Competencies)
 * aus web/src/composables/question.mock.ts und skillgraph.mock.ts 1:1 ins
 * v2-Backend (MongoDB).
 *
 * Nutzung:
 *   npm run seed
 *
 * Läuft idempotent: bestehende Collections werden vorher geleert, damit ein
 * wiederholter Aufruf keine Duplikate erzeugt.
 *
 * Hinweis: Dieses Script importiert die TS-Dateien des Frontends direkt
 * (siehe tsconfig.seed.json für den @/-Alias auf web/src). Es ist bewusst ein
 * einmaliges Migrations-Werkzeug und kein Teil der laufenden App.
 */
import { connect, disconnect } from "../mongo/mongo";
import { CompetencyRepository } from "../competency/competency.repository";
import { QuestionRepository } from "../question/question.repository";
import { competencies, questions } from "@/composables/skillgraph.mock";

async function seed() {
  const db = await connect();

  const competencyCollection = db.collection("competency");
  const questionCollection = db.collection("question");

  await competencyCollection.deleteMany({});
  await questionCollection.deleteMany({});

  const competencyRepository = new CompetencyRepository(db);
  const questionRepository = new QuestionRepository(db);

  // Competency-IDs aus dem Frontend (z.B. "c-sql") werden zu neuen Mongo-
  // ObjectIds. Damit competencyIds/prerequisites/competencyLinks konsistent
  // bleiben, merken wir uns die Zuordnung alte-ID -> neue-ID.
  const idMap = new Map<string, string>();

  for (const competency of competencies) {
    const created = await competencyRepository.create({
      name: competency.name,
      description: competency.description,
      category: competency.category
      // parentId/prerequisites werden erst im zweiten Durchlauf gesetzt,
      // weil sie auf andere (evtl. noch nicht angelegte) Competencies verweisen.
    });
    idMap.set(competency.id, created.id);
  }

  for (const competency of competencies) {
    const newId = idMap.get(competency.id);
    if (!newId) continue;

    const parentId = competency.parentId ? idMap.get(competency.parentId) ?? null : null;
    const prerequisites = competency.prerequisites?.map((prerequisite) => ({
      competencyId: idMap.get(prerequisite.competencyId) ?? prerequisite.competencyId,
      minimumMastery: prerequisite.minimumMastery
    }));

    await competencyRepository.update(newId, { parentId, prerequisites });
  }

  let questionCount = 0;
  for (const question of questions) {
    const legacy = question.legacyQuestion as
      | (Record<string, unknown> & { questiontype?: string })
      | undefined;

    // Die Antwortoptionen (optionRows, answerColumns, multipleRow, ...) liegen
    // als Top-Level-Felder im rohen Mock-Objekt, nicht in questionconfiguration.
    // Wir übernehmen daher das komplette Rohobjekt (ohne die bereits separat
    // gespeicherten Felder) als questionConfiguration.
    const { _id, owner, questiontext, questiontags, questiontype, ...rawConfig } = legacy ?? {};
    void _id;
    void owner;
    void questiontext;
    void questiontags;

    await questionRepository.create({
      text: question.text,
      title: question.title,
      competencyIds: question.competencyIds.map((id) => idMap.get(id) ?? id),
      competencyLinks: question.competencyLinks?.map((link) => ({
        ...link,
        competencyId: idMap.get(link.competencyId) ?? link.competencyId
      })),
      difficulty: question.difficulty,
      excludeFromAlgorithm: question.excludeFromAlgorithm,
      questionType: questiontype as string | undefined,
      questionConfiguration: Object.keys(rawConfig).length > 0 ? rawConfig : undefined
    });
    questionCount += 1;
  }

  console.log(`Seed complete: ${competencies.length} competencies, ${questionCount} questions.`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnect();
  });
