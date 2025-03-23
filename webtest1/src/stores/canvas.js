import { defineStore } from 'pinia'

export const useCanvasStore = defineStore('canvas', {
    state: () => ({
        element: null,
        elements: [],
        backgroundImg: null,
        backgroundImgUrl: null,
    }),
    actions: {

    }, 
    getters: {

    }
})