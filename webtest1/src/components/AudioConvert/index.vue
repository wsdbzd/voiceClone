<template>
  <div class="audio-convert">
    <div class="audio-convert-container">
      <div class="up">
        <StepVideo />
      </div>
      <div class="down">

        <div v-if="!videoStore.videoUrl && videoStore.step === 0" class="item">
          <UploadVideo />
        </div>

        <div v-if="videoStore.videoUrl && videoStore.step === 0" class="item">
          <DisplayVideo />
        </div>

        <div v-if="videoStore.step === 1" class="item">
          <SelectAudio />
        </div>

        <div v-if="videoStore.step === 2" class="item">
          <CompositeVideo />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { useVideoStore } from "../../stores/video";
import { onMounted, ref } from "vue";
import StepVideo from "./components/StepVideo/index.vue";
import UploadVideo from "./components/UploadVideo/index.vue";
import DisplayVideo from "./components/DisplayVideo/index.vue";
import SelectAudio from "./components/SelectAudio/index.vue";
import CompositeVideo from "./components/CompositeVideo/index.vue";

const videoStore = useVideoStore();

onMounted(() => {
  videoStore.step = 0;
})
</script>

<style lang="scss" scoped></style>
