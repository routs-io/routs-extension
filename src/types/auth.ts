export interface IAuthStore {
  isRegistered: boolean
  isLocked: boolean
  isExternalRequest: boolean
}

export interface IPasswordValidation {
  id: string
  text: string
  status: boolean
}
