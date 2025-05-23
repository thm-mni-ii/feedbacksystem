import type Catalog from '@/model/Catalog'
import type Course from '@/model/Course'
import type Question from '@/model/Question'
import axios, { type AxiosResponse } from 'axios'

class CatalogService {
  getMyCourses(): Promise<AxiosResponse<Course[]>> {
    return axios.get(`/core/users/${localStorage.getItem('userId')}/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  changeNeededScore(
    question: string,
    score: number,
    transition: string
  ): Promise<AxiosResponse<Catalog>> {
    console.log(question)
    console.log(score)
    console.log(transition)
    return axios.put(
      `/api_v1/change_needed_score/`,
      { question, score, transition },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }
  addChildrenToQuestion(
    question: string,
    child: string,
    key: number,
    transition: string
  ): Promise<AxiosResponse<Catalog>> {
    return axios.put(
      `/api_v1/addChildrenToQuestion/`,
      { question, child, key, transition },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }
  deleteQuestionFromCatalog(questionInCollection: string): Promise<AxiosResponse<Catalog>> {
    return axios.delete(`/api_v1/removeQuestionFromCatalog/${questionInCollection}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getPreviousQuestion(catalog: string, id: string): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/getPreviousQuestion/${catalog}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  editCatalog(catalog: string, id: string): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/editCatalog/${catalog}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  editEmptyCatalog(catalog: string): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/editEmptyCatalog/${catalog}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getAccessibleCourses(): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/accessibleCourses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getCatalog(id: string): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/catalog/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getCatalogs(id: number): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/catalogs/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  postCatalog(data: Catalog): Promise<AxiosResponse<Catalog>> {
    return axios.post(`/api_v1/catalog/`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  putCatalog(data: Catalog): Promise<AxiosResponse<Catalog>> {
    return axios.put(`/api_v1/catalog/${data.id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  addQuestion(data: any): Promise<AxiosResponse<Catalog>> {
    return axios.put(`/api_v1/addQuestionToCatalog`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  deleteCatalog(id: string): Promise<AxiosResponse<any>> {
    return axios.delete(`/api_v1/catalog/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getQuestionsFromCatalog(id: string): Promise<AxiosResponse<Question[]>> {
    return axios.get(`/api_v1/current_question/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getCatalogScore(sessionId: string): Promise<AxiosResponse<any>> {
    return axios
      .get(`/api_v1/getCatalogScore/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      })
      .then((res) => {
        console.log('getCatalogScore: ', res)
        return res
      })
  }
}

export default new CatalogService()
