import type Question from '@/model/Question'
import apiV2 from '@/services/apiV2Client'
import type { AxiosResponse } from 'axios'

/**
 * `Question` in `@/model/Question` entspricht jetzt 1:1 dem v2-Backend-DTO
 * (`api/backend/v2/src/question/question.model.ts`), daher braucht es hier
 * keine Mapper-Funktionen mehr zwischen zwei unterschiedlichen Shapes.
 */
class QuestionService {
  getQuestion(questionId: string): Promise<AxiosResponse<Question>> {
    return apiV2.get<Question>(`/questions/${questionId}`)
  }

  createQuestion(question: Question): Promise<AxiosResponse<Question>> {
    const { id, ...payload } = question
    return apiV2.post<Question>('/questions', payload)
  }

  updateQuestion(question: Question): Promise<AxiosResponse<Question>> {
    const { id, ...payload } = question
    return apiV2.put<Question>(`/questions/${id}`, payload)
  }

  deleteQuestion(questionId: string): Promise<AxiosResponse<void>> {
    return apiV2.delete(`/questions/${questionId}`)
  }

  getAllQuestions(): Promise<AxiosResponse<Question[]>> {
    return apiV2.get<Question[]>('/questions')
  }
}

export default new QuestionService()
