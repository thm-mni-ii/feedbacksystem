import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

class QuestionService {
  getQuestion(questionId: string): Promise<AxiosResponse<Question>> {
    return axios.get('api_v1/question', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` },
      params: { ID: questionId }
    })
  }
  createQuestion(question: Question): Promise<AxiosResponse<Question>> {
    return axios.post('api_v1/question', question, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
    })
  }
  updateQuestion(question: Question): Promise<AxiosResponse<Question>> {
    return axios.put('api_v1/question', question, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
    })
  }

  getAllQuestions(): Promise<AxiosResponse<Question[]>> {
    return axios.get('api_v1/allquestions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
    })
  }
}

export default new QuestionService()
