import type { https } from 'firebase-functions/v2'
import type { Response } from 'express'

export const helloWorld = async (req: https.Request, res: Response) => {
  res.send('Hello from Firebase!')
}
