import type {
  Competency,
  QMatrix,
  QMatrixValidationResult,
  Question,
  QuestionCompetencyLink
} from '@/model/types'

function normalizeQuestionLinks(question: Question): QuestionCompetencyLink[] {
  if (question.competencyLinks && question.competencyLinks.length > 0) {
    return question.competencyLinks
      .filter((link) => !!link.competencyId)
      .map((link) => ({
        competencyId: link.competencyId,
        weight: link.weight ?? 1,
        relation: link.relation ?? 'required'
      }))
  }

  // Backward compatibility for existing data model.
  return question.competencyIds.map((competencyId) => ({
    competencyId,
    weight: 1,
    relation: 'required'
  }))
}

export function getQuestionCompetencyLinks(question: Question): QuestionCompetencyLink[] {
  return normalizeQuestionLinks(question)
}

export function getQuestionCompetencyIds(question: Question): string[] {
  return [...new Set(normalizeQuestionLinks(question).map((link) => link.competencyId))]
}

export function buildQMatrix(questions: Question[], competencies: Competency[]): QMatrix {
  const itemIds = questions.map((q) => q.id)
  const competencyIds = competencies.map((c) => c.id)
  const columnIndex = new Map(competencyIds.map((id, index) => [id, index]))

  const values = questions.map((question) => {
    const row = competencyIds.map(() => 0)

    for (const link of normalizeQuestionLinks(question)) {
      const col = columnIndex.get(link.competencyId)
      if (col === undefined) continue

      const linkWeight = Math.max(0, link.weight ?? 1)
      row[col] = Math.max(row[col], linkWeight)
    }

    return row
  })

  return {
    itemIds,
    competencyIds,
    values
  }
}

export function validateQMatrix(
  questions: Question[],
  competencies: Competency[]
): QMatrixValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const competencyIds = new Set(competencies.map((c) => c.id))
  const questionsByCompetency = new Map<string, number>()

  for (const question of questions) {
    const links = normalizeQuestionLinks(question)

    if (links.length === 0) {
      errors.push(`Question '${question.id}' has no competencies assigned.`)
      continue
    }

    const uniqueInQuestion = new Set<string>()

    for (const link of links) {
      uniqueInQuestion.add(link.competencyId)

      if (!competencyIds.has(link.competencyId)) {
        errors.push(
          `Question '${question.id}' references unknown competency '${link.competencyId}'.`
        )
      }
    }

    if (uniqueInQuestion.size > 1) {
      // Multi-attribute items are expected and supported; this is informational.
      warnings.push(
        `Question '${question.id}' is multi-attribute (${uniqueInQuestion.size} competencies).`
      )
    }

    for (const competencyId of uniqueInQuestion) {
      questionsByCompetency.set(competencyId, (questionsByCompetency.get(competencyId) ?? 0) + 1)
    }
  }

  for (const competency of competencies) {
    const count = questionsByCompetency.get(competency.id) ?? 0
    if (count === 0) {
      errors.push(`Competency '${competency.id}' has no linked questions.`)
    }
  }

  // Practical CDM heuristic: for early-stage diagnostics, at least some single-attribute items
  // improve identifiability and cleaner parameter estimation.
  const singleAttributeItems = questions.filter(
    (q) => getQuestionCompetencyIds(q).length === 1
  ).length
  if (singleAttributeItems === 0) {
    warnings.push(
      'No single-attribute items found. Diagnosis is possible, but identifiability and interpretability may degrade.'
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
