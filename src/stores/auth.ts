import { defineStore } from "pinia"
import { useStorageStore } from "./storage";
import type { IAuthStore } from '@/types/auth';

export const useAuthStore = defineStore('auth', {
    state: (): IAuthStore => ({
        isRegistered: false,
        isLogged: false
    }),
    actions: {
        setIsRegistered(value: boolean) {
            this.isRegistered = value;
        },
        async setPassword(password: string): Promise<boolean> {
            const { set } = useStorageStore();
            await set('password', password);
            return true;
        },
        async checkPassword(password: string, updateLogged: boolean = true): Promise<boolean> {
            if (!this.isRegistered) {
                return false;
            }
            const { get } = useStorageStore();
            const response = await get('password');
            if(updateLogged) password === response ? this.isLogged = true : this.isLogged = false;
            return password === response
        },
        async checkIsRegistered() {
            const { get } = useStorageStore();
            const response = await get('password');
            this.setIsRegistered(response !== null);
        },
        logout() {
            this.isLogged = false
        }
    }
})