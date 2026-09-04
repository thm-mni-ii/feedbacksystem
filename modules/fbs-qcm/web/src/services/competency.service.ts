import apiV2 from '@/services/apiV2Client'
import type { Competency } from '@/model/types'
import type { AxiosResponse } from 'axios'

/**
 * Service für die v2-Competency-API (`api/backend/v2/src/competency`).
 * Ersetzt das alte "Tags"-Konzept: Fragen werden nicht mehr mit Freitext-Tags
 * versehen, sondern mit existierenden Competencies verknüpft (siehe
 * `question.service.ts`, `competencyIds`).
 */
class CompetencyService {
  getAllCompetencies(): Promise<AxiosResponse<Competency[]>> {
    return apiV2.get('/competencies')
  }

  getCompetency(competencyId: string): Promise<AxiosResponse<Competency>> {
    return apiV2.get(`/competencies/${competencyId}`)
  }

  createCompetency(competency: Omit<Competency, 'id'>): Promise<AxiosResponse<Competency>> {
    return apiV2.post('/competencies', competency)
  }

  updateCompetency(
    competencyId: string,
    competency: Partial<Omit<Competency, 'id'>>
  ): Promise<AxiosResponse<Competency>> {
    return apiV2.put(`/competencies/${competencyId}`, competency)
  }

  deleteCompetency(competencyId: string): Promise<AxiosResponse<void>> {
    return apiV2.delete(`/competencies/${competencyId}`)
  }
}

export default new CompetencyService()
