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
  deleteQuestionFromCatalog(questionInCollection: string): Promise<AxiosResponse<Catalog>> {
    return axios.delete(`/api_v1/removeQuestionFromCatalog/${questionInCollection}`, {
      headers: {
        Authorization: "Bearer "
      }
    })
  }
  getPreviousQuestion(catalog: string, id: string): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/getPreviousQuestion/${catalog}/${id}`, {
      headers: {
        Authorization: "Bearer "
      }
    })
  }
  editCatalog(catalog: string, id: string): Promise<AxiosResponse<Catalog>> {
    return axios.get(`/api_v1/editCatalog/${catalog}/${id}`, {
      headers: {
        Authorization: "Bearer "
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
  postCatalog(data: Catalog): Promise<AxiosResponse<Catalog>> {
    return axios.post(`/api_v1/catalog/`, data, {
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
}

export default new CatalogService()
