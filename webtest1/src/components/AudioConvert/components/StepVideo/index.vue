<template>
  <div class="step-video">
    <div
      v-for="(option, index) in stepOptions"
      :key="index"
      class="step-option"
      :class="{ active: index === videoStore.step }"
    >
      <div class="step-number">{{ option.number }}</div>
      <div class="step-title">{{ option.title }}</div>
    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { ref } from "vue";
import { useVideoStore } from "../../../../stores/video";

const videoStore = useVideoStore();
const stepOptions = ref([
  {
    number: 1,
    title: "上传视频",
  },
  {
    number: 2,
    title: "选择音频",
  },
  {
    number: 3,
    title: "合成视频",
  },
]);
</script>

<style lang="scss" scoped></style>
