import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

/**
 * Gemeinsamer axios-Client für das neue Backend v2 (`api/backend/v2`).
 *
 * v2 verlangt für jede Anfrage einen gültigen JWT-Token (Platzhalter-Auth,
 * siehe api/backend/v2/src/middleware/authenticateToken.ts). Da es noch kein
 * echtes Login-System gibt, das v2-Tokens ausstellt, wird hier bewusst ein
 * fest hinterlegter Entwickler-Token mitgeschickt ("so tun als wäre man
 * eingeloggt"). Das ist eine bewusste Übergangslösung, bis die echte
 * Auth-Domain kommt (siehe Plan: v2-course-auth-domain) und darf NICHT für
 * echte Produktionsdaten verwendet werden.
 *
 * Der Token ist mit dem Standard-Secret aus `.env.example` (JWT_SECRET=change-me)
 * signiert. Wer ein eigenes JWT_SECRET in seiner lokalen `.env` setzt, muss
 * sich hier einen neuen Token generieren, siehe README.md im Backend v2.
 */
const DEV_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRldiIsImlkIjoxLCJpYXQiOjE3ODg1MTQ2NjF9.pEsXaCo7QbOz1k7FjFPecnxVICm4CIKMnrJXGjvF16w'

type AuthTokenClaims = {
  id: number
}

export function getAuthenticatedStudentId(): string {
  return String(jwtDecode<AuthTokenClaims>(DEV_TOKEN).id)
}

const apiV2 = axios.create({
  baseURL: '/api_v2',
  headers: {
    Authorization: `Bearer ${DEV_TOKEN}`
  }
})

export default apiV2
