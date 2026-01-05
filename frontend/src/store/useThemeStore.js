//src/store/useThemeStore.js
import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("LetsChat-theme") || "Autumn",
  setTheme: (theme) => {
    localStorage.setItem("LetsChat-theme", theme);
    set({ theme })
},
}));