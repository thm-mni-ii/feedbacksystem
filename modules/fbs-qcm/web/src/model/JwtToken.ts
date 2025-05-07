import type { JwtPayload } from 'jwt-decode'

export default interface JwtToken extends JwtPayload {
  id?: string
  globalRole?: string
}
