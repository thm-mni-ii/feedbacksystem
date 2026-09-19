import QuestionType from '@/enums/QuestionType'
import type { Competency, Question } from '@/model/types'
import type { Choice } from '@/model/questionTypes/Choice'
import type FillInTheBlanks from '@/model/questionTypes/FillInTheBlanks'
import type { Matching } from '@/model/questionTypes/Matching'
import { getQuestionCompetencyIds } from '@/composables/qMatrix'
import competencyService from '@/services/competency.service'
import questionService from '@/services/question.service'

type QuestionConfiguration = Choice | FillInTheBlanks | Matching

function toQuestionType(value: unknown): QuestionType | null {
  if (value === QuestionType.Choice || value === 'single-choice' || value === 'matrix') {
    return QuestionType.Choice
  }
  if (value === QuestionType.FillInTheBlanks || value === 'fill-in-the-blank') {
    return QuestionType.FillInTheBlanks
  }
  // 'matching' ist der Legacy-/Backend-v2-String für Zuordnungsaufgaben (siehe
  // EditQuestion.vue). Er wurde hier fälschlich der Choice-Gruppe zugeordnet,
  // wodurch Matching-Fragen in der Lernsession mit der Choice-UI (statt der
  // vue-draggable-Zuordnungskomponente) gerendert und dabei falsch angezeigt
  // wurden, da die Konfiguration (categories/items) nicht zu optionRows passt.
  if (value === QuestionType.Matching || value === 'matching') {
    return QuestionType.Matching
  }
  return null
}

function toStudyQuestion(question: {
  id?: string
  text?: string
  title?: string
  competencyIds: string[]
  competencyLinks?: Question['competencyLinks']
  questionType: unknown
  questionConfiguration: unknown
  difficulty: number
  excludeFromAlgorithm?: boolean
}): Question {
  if (!question.id || !question.text) {
    throw new Error('Eine geladene Frage enthält keine ID oder keinen Fragetext.')
  }
  const questionType = toQuestionType(question.questionType)
  if (!questionType) {
    throw new Error(`Frage '${question.id}' verwendet einen nicht unterstützten Fragetyp.`)
  }
  if (!question.questionConfiguration || typeof question.questionConfiguration !== 'object') {
    throw new Error(`Frage '${question.id}' enthält keine ausführbare Fragenkonfiguration.`)
  }

  return {
    id: question.id,
    text: question.text,
    title: question.title,
    competencyIds: question.competencyIds,
    competencyLinks: question.competencyLinks,
    questionType,
    questionConfiguration: question.questionConfiguration as QuestionConfiguration,
    difficulty: question.difficulty,
    excludeFromAlgorithm: question.excludeFromAlgorithm
  }
}

class StudyContentService {
  async getStudyContent(courseId?: string): Promise<{
    competencies: Competency[]
    questions: Question[]
  }> {
    const [competenciesResponse, questionsResponse] = await Promise.all([
      courseId
        ? competencyService.getCompetenciesByCourse(courseId)
        : competencyService.getAllCompetencies(),
      questionService.getAllQuestions()
    ])
    const competencies = competenciesResponse.data
    const competencyIds = new Set(competencies.map((competency) => competency.id))
    const questions = questionsResponse.data.map(toStudyQuestion)

    return {
      competencies,
      questions: courseId
        ? questions.filter((question) => {
            const questionCompetencyIds = getQuestionCompetencyIds(question)
            return (
              questionCompetencyIds.length > 0 &&
              questionCompetencyIds.every((competencyId) => competencyIds.has(competencyId))
            )
          })
        : questions
    }
  }
}

export default new StudyContentService()
