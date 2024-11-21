export interface IAuthStore {
  isRegistered: boolean
  isLocked: boolean
  isExternalRequest: boolean
  projectVersion: string
}

export interface IPasswordValidation {
  id: string
  text: string
  status: boolean
}
