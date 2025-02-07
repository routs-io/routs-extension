import { defineStore } from 'pinia'
import type { IToasterState, IToaster } from '@/types/toaster'

export const useToasterStore = defineStore('toaster', {
  state: (): IToasterState => ({
    toaster: null
  }),

  actions: {
    openToaster({ text, color = 'green' }: IToaster) {
      setTimeout(() => (this.toaster = { text, color }), 200)
      setTimeout(() => this.closeToaster(), 3000)
    },

    closeToaster() {
      this.toaster = null
    }
  }
})
