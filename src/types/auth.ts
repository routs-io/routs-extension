export interface IAuthStore {
  isRegistered: boolean
  isLocked: boolean | null
  isExternalRequest: boolean
  projectVersion: string
}

export interface IPasswordValidation {
  id: string
  text: string
  status: boolean
}
