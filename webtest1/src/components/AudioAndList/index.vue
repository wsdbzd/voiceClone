<template>
    <div>
        <div class="audio-list" v-if="!audioStore.isCloseAudioList">
            <div class="operation">
                <div class="up">
                    <div class="close" @click="audioStore.isCloseAudioList = true">x</div>
                    <div class="fold" @click="isFold = !isFold">
                        <span v-if="!isFold">展开配音列表 ></span>
                        <span v-if="isFold">
                            < 收起配音列表</span>
                    </div>
                </div>

                <!-- 配音角色的信息 -->
                <div class="info">
                    <div class="audio-img">
                        <img v-if="audioStore.selectCharacter" :src="audioStore.selectCharacter.imgUrl
                            " alt="image" />
                    </div>
                    <div class="audio-info" >
                        <div>
                            {{
                                audioStore.selectCharacter && audioStore.selectCharacter.name
                            }}
                        </div>
                        <div>
                            {{ audioStore.selectCharacter && audioStore.selectCharacter.tag }}
                        </div>
                    </div>
                </div>

                <!-- 配音角色的音频 -->
                <div class="audios">
                    <div class="audio" @click="handlePlayAudio" v-if="audioStore.selectCharacter">
                        <img v-if="playingAudioState === 'play'" src="./image/play.png" alt="" />
                        <img v-if="playingAudioState === 'loading'" src="./image/loading.gif" alt="" />
                        <img v-if="playingAudioState === 'pause'" src="./image/pause.png" alt="" />
                        <div>
                            {{
                                audioStore.selectCharacter &&
                                audioStore.selectCharacter.audioName
                            }}
                        </div>
                    </div>
                </div>

                <!-- 配音设置 -->
                <div class="setting">
                    <div class="item">
                        <div class="title">配音语速</div>
                        <div class="content">
                            <div class="speed-box">
                                <span>0.1x </span>
                                <input v-model="speed" type="range" min="0.1" max="3" step="0.1" />
                                <span> 3x</span>
                            </div>
                            <input class="speed" v-model="speed" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- 配音角色列表 -->
            <div v-if="isFold">
                <CharacterList></CharacterList>
            </div>
        </div>
    </div>
</template>

<script setup>
import './index.scss'
import { ref, watch } from "vue";
import { getAudioOrImg } from "../../api/api.js";
import CharacterList from "../CharacterList/index.vue";
import { useAudioStore } from "../../stores/audio.js";

const audioStore = useAudioStore();

const isFold = ref(true);
const speed = ref(1);

// 监听 speed 的变化
watch(speed, (newValue) => {
    if (newValue > 3) {
        speed.value = 3; // 如果 speed 大于 3，则重置为 3
    }
});

let tmpAudio = ref(null); // 临时音频
const playingAudioState = ref('play'); // 是否正在播放音频
const handlePlayAudio = async () => { // 点击播放音频
    if (playingAudioState.value === 'play') {
        playingAudioState.value = 'loading'
        let audioPath = audioStore.selectCharacter.audioPath
        let audioBlob = await getAudioOrImg(audioPath)
        let audioUrl = URL.createObjectURL(audioBlob)

        tmpAudio = new Audio(audioUrl);

        if (playingAudioState.value === 'loading') {
            playingAudioState.value = 'pause'
            tmpAudio.play()

            // 播放音频
            tmpAudio.play().then(() => {
                // 音频播放完成后设置为不在播放状态
                tmpAudio.onended = () => {
                    playingAudioState.value = 'play';  // 更改播放状态为 'play'
                };
            }).catch(error => {
                // 捕获播放错误（比如没有音频文件或其他问题）
                console.error('Audio playback error:', error);
            });
        }
    } else {
        playingAudioState.value = 'play'
        tmpAudio.pause()
    }
}
</script>

<style lang="scss" scoped></style>
