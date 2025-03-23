<template>
  <div class="audio-lesson">
    <!-- 角色选择弹窗 -->
    <div v-if="!audioStore.isCloseAudioList">
      <div class="selectVoiceover">
        <div class="header"></div>
        <div class="body">
          <AudioAndList></AudioAndList>
        </div>
      </div>
      <div class="overlay"></div>
    </div>

    <div class="audio-lesson-container">
      <div class="up">
        <div class="select-language">
          <span>选择语言：</span>
          <select v-model="selectedLanguage">
            <option value="">请选择语言</option>
            <option
              v-for="(levels, lang) in languageLevels"
              :key="lang"
              :value="lang"
            >
              {{ lang }}
            </option>
          </select>
        </div>

        <div class="select-level">
          <span>选择语言等级：</span>
          <select v-model="selectedLevel">
            <option value="">请选择等级</option>
            <option v-for="level in filteredLevels" :key="level">
              {{ level }}
            </option>
          </select>
        </div>

        <div class="select-role" @click="audioStore.isCloseAudioList = false">
          <button>选择角色</button>
          <div class="role-name">
            {{
              audioStore.selectCharacter
                ? audioStore.selectCharacter.name
                : "未选择角色"
            }}
          </div>
        </div>
      </div>

      <div class="down">
        <div class="left">
          <textarea
            placeholder="请输入文本内容"
            v-model="textContent"
          ></textarea>
        </div>

        <div class="right">
          <div class="record-box">
            <div class="record">
              <div>
                <button
                  v-if="recordState === 'idle'"
                  class="record-btn"
                  @click="startRecording"
                >
                  录音
                </button>
                <button
                  v-if="recordState === 'recording'"
                  class="stop-record-btn"
                  @click="stopRecording"
                >
                  停止录音
                </button>
              </div>

              <div v-if="recordState === 'finished'" class="record-box-inner">
                <div class="record-audio-box">
                  <audio controls :src="audioUrl"></audio>
                </div>
                <div class="record-btn-box">
                  <button class="restart-record-btn" @click="restartRecording">
                    重新录音
                  </button>
                  <button class="confirm-record-btn" @click="confirmRecording">
                    确认
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="speech-recognition-box">
            <textarea
              placeholder="系统会自动识别录音的内容"
              disabled
              v-model="speechRecognitionContent"
            ></textarea>
          </div>

          <div class="score-and-audio-box">
            <div class="score-box" :class="getScoreClass">
              你的语音评分：{{ speechScore }}
            </div>
            <div class="audio-box">
              <audio controls :src="SampleAudio"></audio>
            </div>
          </div>

          <div class="ai-analysis-box">
            <textarea
              placeholder="系统会自动反馈读音的不足之处"
              disabled
              v-model="aiAnlysisContent"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { languageLevels } from "./index.js";
import { useAudioStore } from "../../stores/audio.js";
import SampleAudio from "./audio/audio.wav";
import AudioAndList from "../AudioAndList/index.vue";
import "./index.scss";

const audioStore = useAudioStore();
const selectedLanguage = ref("");
const selectedLevel = ref("");
const textContent = ref("");
const speechRecognitionContent = ref("");
const aiAnlysisContent = ref("");
const speechScore = ref(85);
const recordState = ref("idle"); // idle, recording, finished
const audioUrl = ref(""); // 录音文件URL
let mediaRecorder;
let audioChunks = [];

onMounted(() => {
  audioStore.isCloseAudioList = true;
});

// 计算属性：根据所选语言筛选对应等级
const filteredLevels = computed(
  () => languageLevels[selectedLanguage.value] || []
);

// 根据评分动态切换样式
const getScoreClass = computed(() => {
  if (speechScore.value >= 85) {
    return 'excellent';
  } else if (speechScore.value >= 70) {
    return 'good';
  } else if (speechScore.value >= 50) {
    return 'average';
  } else {
    return 'poor';
  }
});

// 开始录音
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      audioUrl.value = URL.createObjectURL(audioBlob);
      recordState.value = "finished";
    };

    mediaRecorder.start();
    recordState.value = "recording";
  } catch (error) {
    console.error("录音失败:", error);
  }
};

// 停止录音
const stopRecording = () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
};

// 重新录音
const restartRecording = () => {
  recordState.value = "idle";
  audioUrl.value = "";
};

// 确认录音
const confirmRecording = () => {
  console.log("音频已确认:", audioUrl.value);
};
</script>

<style lang="scss" scoped></style>
