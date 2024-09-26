import type { ISOString } from './ISOString'

export interface User {
  uid: string
  firstName: string
  lastName: string
  email: string
  created: ISOString
}
