export interface Submission {
  name: string
  desc: string
  repo: string
  pres: string
}

export interface Team {
  id: string
  name: string
  members: string[]
  submission: Submission
  deleted: boolean
  table: string
}
