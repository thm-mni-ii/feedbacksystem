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
  addQuestionToCatalog(question: Question, catalog: string ): Promise<AxiosResponse<Question>> {
    return axios.put('/api_v1/addQuestionToCatalog', { question: question, catalog: catalog, children: []}, {
      headers: { Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY291cnNlUm9sZXMiOiJ7XCIxXCI6XCJET0NFTlRcIn0iLCJpZCI6MTIsImdsb2JhbFJvbGUiOiJBRE1JTiJ9.iln7aK05KPy3D_FUt6OBhSEOuYgOgGHmBYqSd0UPP7E"}
    })
  }
  getAllQuestions(): Promise<AxiosResponse<Question[]>> {
    return axios.get('/api_v1/allquestions', {
      headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY291cnNlUm9sZXMiOiJ7XCIxXCI6XCJET0NFTlRcIn0iLCJpZCI6MTIsImdsb2JhbFJvbGUiOiJBRE1JTiJ9.iln7aK05KPy3D_FUt6OBhSEOuYgOgGHmBYqSd0UPP7E`}
    })
  }
}

export default new QuestionService()
