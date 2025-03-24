import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

class QuestionService {
  getQuestion(questionId: string): Promise<AxiosResponse<Question>> {
    return axios
      .get(`/api_v1/question/${questionId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` },
        params: { ID: questionId }
      })
      .then((response) => {
        console.log('Response status:', response.status)
        console.log('Response data:', response.data)
        return response
      })
      .catch((error) => {
        console.error('Error fetching question:', error)
        throw error
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
  addQuestionToCatalog(question: Question, catalog: string): Promise<AxiosResponse<Question>> {
    return axios.put(
      '/api_v1/addQuestionToCatalog',
      { question: question, catalog: catalog, children: [] },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      }
    )
  }
  getAllQuestions(): Promise<AxiosResponse<Question[]>> {
    return axios.get('/api_v1/allquestions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
    })
  }
  getAllTags(): Promise<AxiosResponse<String[]>> {
    return axios
      .get('/api_v1/getAllTags', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jsessionid')}` }
      })
      .then((res) => {
        console.log('all tags: ', res.data)
        return res
      })
      .catch((err) => {
        return err
      })
  }
}

export default new QuestionService()
