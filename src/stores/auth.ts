import { defineStore } from 'pinia'
import { useStorageStore } from './storage'
import type { IAuthStore } from '@/types/auth'

export const useAuthStore = defineStore('auth', {
  state: (): IAuthStore => ({
    isRegistered: false,
    isLocked: null,
    isExternalRequest: false,
    projectVersion: '1.1.5'
  }),
  actions: {
    setIsRegistered(value: boolean) {
      this.isRegistered = value
    },

    async setPassword(password: string): Promise<boolean> {
      const { set } = useStorageStore()
      await set('password', password)
      this.setIsRegistered(true)
      await this.updateIsLocked(false)
      return true
    },

    async checkPassword(password: string): Promise<boolean> {
      console.log(this.isRegistered)
      if (!this.checkIsRegistered()) {
        return false
      }
      const { get } = useStorageStore()
      const response = await get('password')
      await this.updateIsLocked(password !== response)
      console.log(password, response)
      return password === response
    },

    async checkIsRegistered() {
      const { get } = useStorageStore()
      const response = await get('password')

      this.setIsRegistered(response !== null && typeof response !== 'undefined')
    },

    async updateIsLocked(locked: boolean) {
      this.isLocked = locked
      const { set } = useStorageStore()
      await set('isLocked', locked)
    },

    async checkIsLocked() {
      const { get } = useStorageStore()
      const response = await get('isLocked')

      this.isLocked = response ?? true
    }
  }
})
