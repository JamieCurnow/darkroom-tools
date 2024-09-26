import type { ISOString } from './ISOString'

export interface MigrationDoc {
  migrations: Record<string, Migration>
}

export interface Migration {
  hasRun: boolean
  timestamp: ISOString
}
