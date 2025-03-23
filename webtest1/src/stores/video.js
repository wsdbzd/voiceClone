import { defineStore } from 'pinia'

export const useVideoStore = defineStore('video', {
    state: () => ({
        video: null,
        videoUrl: null,
        caption: null,
        audio: null,
        audioUrl: null,
        record: null,
        recordUrl: null,
        step: 1,
        compositeVideo: null,
        compositeVideoUrl: null,
    }),
    actions: {

    },
    getters: {

    }
})