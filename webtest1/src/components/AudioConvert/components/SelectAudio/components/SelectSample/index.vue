<template>
  <div class="select-sample">
    <div class="select-sample-container">
      <div
        class="sample-item"
        v-for="(sample, index) in allSamples"
        :key="index"
        @click="handleSelectSample(index)"
        :class="{ active: selectSampleIndex === index }"
      >
        <div class="left-img">
          <img :src="sample.imgUrl" alt="" />
        </div>
        <div class="middle-info">
          <div>{{ sample.name }}</div>
          <div>
            {{
              sample.tag.length > 6
                ? sample.tag.slice(0, 6) + "..."
                : sample.tag
            }}
          </div>
        </div>
        <div class="right-img">
          <img :src="getPlayIcon(sample.playState)" @click="handlePlayPause(sample)" />
        </div>
      </div>
    </div>
    <div class="select-sample-footer">
      <button @click="returnBack">返回</button>
      <button @click="composite">合成</button>
    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { onMounted, ref } from "vue";
import { useVideoStore } from "../../../../../../stores/video";
import { useAudioStore } from "../../../../../../stores/audio";
import PlayImg from './image/play.png'
import PauseImg from './image/pause.png'
import LoadingGif from './image/loading.gif'
import { getAudioOrImg } from "../../../../../../api/api";

const selectSampleIndex = ref(0);
const selectSample = ref(null);
const allSamples = ref([]);
const audioStore = useAudioStore();
const videoStore = useVideoStore();

onMounted(() => {
    allSamples.value = audioStore.characterList.map(sample => ({
        ...sample,
        playState: 'play', // 初始状态
        tmpAudio: null,
    }))
});

const returnBack = () => {
  videoStore.step--;
};

const composite = () => {
    videoStore.step++;
};

const handleSelectSample = (index) => {
    selectSampleIndex.value = index;
    selectSample.value = allSamples.value[index];
};

const getPlayIcon = (state) => {
    switch (state) {
        case 'play': return PlayImg
        case 'loading': return LoadingGif
        default: return PauseImg
    }
}

const handlePlayPause = async (sample) => {
    if (sample.playState === 'play') {
        sample.playState = 'loading'
        let audioPath = sample.audioPath
        let audioBlob = await getAudioOrImg(audioPath)
        let audioUrl = URL.createObjectURL(audioBlob)

        sample.tmpAudio = new Audio(audioUrl)

        if(sample.playState === 'loading'){
            sample.playState = 'pause'
            // tmpAudio.play()

            sample.tmpAudio.play().then(() => {
                sample.tmpAudio.onended = () => {
                    sample.playState = 'play'
                }
            }).catch((e) => {
                console.log(e)
            })
        }
    } else {
        sample.playState = 'play'
        sample.tmpAudio.pause()
    }
}
</script>

<style lang="scss" scoped></style>
