<template>
  <div class="select-audio">
    <div class="select-audio-container">
      <!-- 标签部分 -->
      <div class="select-audio-tabs">
        <div
          v-for="(tab, index) in tabs"
          :key="index"
          class="tab"
          :class="{ active: activeTab === tab.name }"
          @click="activeTab = tab.name"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 内容部分 -->
      <div class="select-audio-content">
        <div v-if="activeTab === 'audio'">
            <SelectSample></SelectSample>
        </div>

        <div class="select-audio-content-item" v-if="activeTab === 'video'">
          <AudioUpload :isUpAudio="true" :selectType="videoAudio"></AudioUpload>
          <div class="btn-group">
            <button @click="videoStore.step--">返回</button>
            <button @click="composite">合成</button>
          </div>
        </div>

        <div class="select-audio-content-item" v-if="activeTab === 'settings'">
          <AudioUpload :isUpAudio="false" :selectType="videoRecord"></AudioUpload>
          <div class="btn-group">
            <button @click="videoStore.step--">返回</button>
            <button @click="composite">合成</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import './index.scss'
import { useVideoStore } from '../../../../stores/video';
import { ref } from "vue";
import AudioUpload from '../../../AudioUpload/index.vue'
import SelectSample from './components/SelectSample/index.vue'

const activeTab = ref("audio"); // 默认激活的标签
const videoStore = useVideoStore();

// 标签数据
const tabs = ref([
  { name: "audio", label: "选择样本" },
  { name: "video", label: "导入音频" },
  { name: "settings", label: "录音" },
]);

const composite = () => {
  videoStore.step++;
}
</script>

<style lang="scss" scoped>

</style>
