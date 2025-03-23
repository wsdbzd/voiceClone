<template>
  <div class="sampleLibrary">
    <div class="audioList">
      <div class="audioItem" v-for="(item, index) in sampleAudioItems" :key="index">
        <div class="audioInfo">
          <div class="up">
            <div class="audioName">{{ item.name }}</div>
            <button>使用声音</button>
          </div>
          <div class="audioLanguage">{{ item.language }}</div>
        </div>
        <!-- <div>
          <button class="playButton" @click="togglePlay(index)">
            {{ item.isPlaying ? "播放" : "暂停" }}
          </button>
        </div> -->
        <audio :ref="(el) => (audioPlayers[index] = el)" :src="audioUrls[index]" controls></audio>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useAudioStore } from '../../stores/audio.js'
import { getAudiosInfo, getAudioOrImg } from "../../api/api.js";
import './index.scss'

onMounted(async () => {
  if (!audioStore.sampleAudioItems.length) {
    audioStore.sampleAudioItems = await getAudiosInfo()
    sampleAudioItems.value = audioStore.sampleAudioItems

    for (let i = 0; i < audioStore.sampleAudioItems.length; i++) {
      const audio = await getAudio(audioStore.sampleAudioItems[i].audioSrc)
      const audioBlob = new Blob([audio], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrls.value[i] = audioUrl
      // console.log(audioUrls.value[i]);
    }
    audioStore.audioUrls = audioUrls.value
  } else {
    audioUrls.value = audioStore.audioUrls
    sampleAudioItems.value = audioStore.sampleAudioItems
  }

})

const audioStore = useAudioStore()
const audioUrls = ref([]);
const sampleAudioItems = ref([]);
const audioPlayers = ref([]);  // 引用音频播放器

const togglePlay = (index) => {
  const audioElement = audioPlayers.value[index]
  if (!audioElement || !audioUrls.value[index]) return

  if (audioElement.paused) {
    audioElement.play().catch(e => {
      console.error('播放失败:', e)
    })
  } else {
    audioElement.pause()
  }

  // 更新音频播放状态
  sampleAudioItems.value[index].isPlaying = !sampleAudioItems.value[index].isPlaying;
};

</script>

<style lang="scss" scoped></style>
