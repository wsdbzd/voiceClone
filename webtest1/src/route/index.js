import { createRouter, createWebHistory } from 'vue-router'

import Index from '../components/index/index.vue'
import PPT from '../components/PPT/index.vue'
import TTS from '../components/TTS/index.vue'
// import SampleLibary from '../components/SampleLibrary/index.vue'
import AudioConvert from '../components/AudioConvert/index.vue'
import AudioLesson from '../components/AudioLesson/index.vue'
import MakePPT from '../components/MakePPT/index.vue'

const routes = [
    {
        path: '/',
        component: TTS,
    },
    {
        path: '/ppt',
        component: PPT,
    },
    {
        path: '/tts',
        component: TTS,
    },
    // {
    //     path: '/sampleLibary',
    //     component: SampleLibary,
    // },
    {
        path: '/audioConvert',
        component: AudioConvert,
    },
    {
        path: '/audioLesson',
        component: AudioLesson,
    },
    {
        path: '/makePPT',
        component: MakePPT,
    }
]
    
const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router