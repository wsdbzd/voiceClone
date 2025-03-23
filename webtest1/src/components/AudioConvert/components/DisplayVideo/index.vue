<template>
    <div class="display-video">
        <div class="display-video-container">
            <div class="video-container">
                <video :src="videoStore.videoUrl" controls></video>
            </div>
            <div class="btn-container">
                <button @click="handleChooseVideo">更换</button>
                <button @click="handleNextStep">下一步</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import './index.scss'
import { ref } from 'vue'
import { useVideoStore } from '../../../../stores/video';

const videoStore = useVideoStore();

const handleChooseVideo = () => {
    videoStore.videoUrl = null;
    videoStore.video = null;
}

const handleNextStep = () => {
    videoStore.step++;
}

</script>

<style lang="scss" scoped>

</style>