import type Skill from '@/model/Skill'
import axios, { type AxiosResponse } from 'axios'
import type Question from '@/model/Question'

class SkillService {
  getSkills(courseId: number): Promise<AxiosResponse<Skill[]>> {
    return axios.get(`/api_v1/courseSkills/${courseId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  getSkill(skillId: string): Promise<AxiosResponse<Skill>> {
    return axios.get(`/api_v1/getSkill/${skillId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  async updateSkill(skillId: string, payload: any) {
    try {
      const response = await axios.put(`/api_v1/skill/${skillId}`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      return response.data
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Skills:', error)
      throw error
    }
  }

  getAllStudyProgress(courseId: number): Promise<AxiosResponse<any>> {
    return axios.get(`/api_v1/skillProgress/${courseId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  createNewSkill(courseId: number, skill: Skill) {
    const plainSkill = JSON.parse(JSON.stringify(skill))
    console.log('SKILL SERVICE - Skill to insert:', plainSkill)
    return axios.post(
      `/api_v1/createSkill/`,
      { ...plainSkill, course: courseId },
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }

  editSkill(skillId: string, skill: Skill) {
    return axios.put(`/api_v1/editSkill/${skillId}`, skill, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  removeQuestion(skillId: string, questionId: string) {
    return axios.delete(`/api_v1/removeQuestionFromSkill/${skillId}/${questionId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  removeSkill(skillId: string | number) {
    return axios.delete(`/api_v1/deleteSkill/${skillId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  getSkillQuestions(skillId: string): Promise<AxiosResponse<any>> {
    return axios.get(`/api_v1/skillQuestions/${skillId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  addQuestionToSkill(skillId: string, questionId: string): Promise<AxiosResponse<any>> {
    return axios.post(
      `/api_v1/addQuestionToSkill/${skillId}/${questionId}`,
      // Wenn kein zusätzlicher Body nötig ist, kann null übergeben werden
      null,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }

  getTotalQuestions(courseId: number): Promise<AxiosResponse<{ totalQuestions: number }>> {
    return axios.get(`/api_v1/totalQuestions/${courseId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
}

export default new SkillService()
