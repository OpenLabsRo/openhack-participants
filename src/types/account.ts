export interface Account {
  id: string
  email: string
  // password is present for the shape but should not be stored in cleartext in real apps
  password: string
  name: string
  // empty string when no team
  teamID: string
}
