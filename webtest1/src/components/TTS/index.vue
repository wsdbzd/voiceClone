<template>
  <div class="tts">
    <!-- 头部内容 -->
    <div class="upper">
      <!-- 音频选择展示 -->
      <div class="audio-select" @click="audioStore.isCloseAudioList = false">
        <div class="audio-img">
          <img
            v-if="audioStore.selectCharacter"
            :src="audioStore.selectCharacter.imgUrl"
            alt="image"
          />
        </div>
        <div class="audio-info" v-if="audioStore.selectCharacter">
          <div>{{ audioStore.selectCharacter.name }}</div>
          <div>{{ audioStore.selectCharacter.tag }}</div>
        </div>
      </div>

      <!-- 按钮 -->
      <div class="btn-group">
        <!-- 导入文本 -->
        <div
          @click="fileTextInput.click()"
          class="item"
          title="导入配音文本，支持txt、docx等格式"
        >
          <img
            src="./image/uploadFile.png"
            :style="{ opacity: textContent.length === 0 ? 0.5 : 1 }"
          />
          <div class="item-text">导入文本</div>
          <input
            type="file"
            accept=".txt,.docx"
            @change="handleTextFileUpload"
            style="display: none"
            ref="fileTextInput"
          />
        </div>

        <!-- 导入音频 -->
        <div
          @click="handleImportAudio"
          class="item"
          title="导入音频文件，支持mp3、wav等格式"
        >
          <img
            src="./image/uploadAudio.png"
            :style="{ opacity: audioStore.audio ? 1 : 0.5 }"
          />
          <div class="item-text">导入音频</div>
          <input
            type="file"
            accept="audio/*"
            @change="handleAudioFileUpload"
            style="display: none"
            ref="fileAudioInput"
          />
        </div>

        <!-- 录音 -->
        <div @click="handleRecord" class="item" title="点击后显示录音界面">
          <img
            src="./image/record.png"
            :style="{ opacity: audioStore.recordAudio ? 1 : 0.5 }"
          />
          <div class="item-text">录音</div>
        </div>

        <!-- 选择语种 -->
        <div
          class="item"
          @click="showOptions = !showOptions"
          title="选择配音的语种（默认根据内容自动识别）"
        >
          <img
            src="./image/language.png"
            :style="{ opacity: selectedLanguage ? 1 : 0.5 }"
          />
          <div class="item-text">{{ selectedLanguage || "选择语种" }}</div>

          <div v-if="showOptions" class="language-options">
            <div
              v-for="language in languages"
              :key="language"
              class="option"
              @click.stop="selectLanguage(language)"
            >
              {{ language }}
            </div>
          </div>
        </div>

        <!-- 背景音乐 -->
        <!-- <div @click="handleImportBgMusic" class="item" title="设置背景音乐">
          <img src="./image/background.png" :style="{ opacity: audioStore.bgMusic ? 1 : 0.5 }" />
          <div class="item-text">背景音乐</div>
          <input type="file" accept="audio/*" @change="handleBgMusicFileUpload" style="display: none"
            ref="fileBgMusicInput" />
        </div> -->

        <!-- 音频生成播放 -->
        <div @click="handlePlayAudio" class="item" title="输入配音内容后试听">
          <img :src="imgType" alt="" />
          <div class="item-text">
            {{
              audioState === "play"
                ? "试听"
                : audioState === "loading"
                ? "加载中"
                : "暂停"
            }}
          </div>
          <audio ref="audioPlayer"></audio>
        </div>
      </div>
    </div>

    <!-- 中间内容 -->
    <div class="middle">
      <!-- 音频列表及内容 -->
      <div>
        <AudioAndList></AudioAndList>
      </div>

      <!-- 输入框 -->
      <div class="input-box">
        <textarea
          placeholder="请输入需要配音的内容，粘贴或输入文本内容，最多3000字"
          v-model="textContent"
        ></textarea>
      </div>
    </div>

    <!-- 底部内容 -->
    <div class="footer">
      <div>字数：{{ textContent.length }} / 3000</div>
    </div>

    <!-- 录音、背景音乐、导入音频的小窗口 -->
    <div v-if="showAudioUpload">
      <div class="audio-upload-box">
        <div class="close"><span @click="showAudioUpload = false">x</span></div>
        <div class="audio-upload-content">
          <AudioUpload
            :audio="selectRecordBgmusicAudio"
            :isUpAudio="isUpAudio"
            :selectType="selectType"
          ></AudioUpload>
        </div>
        <div></div>
      </div>
      <div class="overlay"></div>
    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { computed, onMounted, ref, watch } from "vue";
import AudioAndList from "../AudioAndList/index.vue";
import AudioUpload from "../AudioUpload/index.vue";
import { useAudioStore } from "../../stores/audio.js";
import { getAudioOrImg, getCloneAudio, recognizeAudioContent } from "../../api/api.js";
import mammoth from "mammoth";
import Hls from "hls.js";
import PlayImg from "./image/play.png";
import PauseImg from "./image/pause.png";
import LoadingGif from "./image/loading.gif";

const audioStore = useAudioStore();
const cloneAudio = ref(null); // 克隆的音频文件
const audioPlayer = ref(null); // 音频播放器
const textContent = ref("");
const audioState = ref("play"); // 音频状态，play、loading、pause
const fileTextInput = ref(null); // 上传文件input
const imgType = computed(() => {
  return audioState.value === "play"
    ? PlayImg
    : audioState.value === "loading"
    ? LoadingGif
    : PauseImg;
});

onMounted(() => {
  audioStore.isCloseAudioList = false;
});

// 上传文本文件
const handleTextFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    if (file.name.endsWith(".txt")) {
      textContent.value = await readTxtFile(file);
    } else if (file.name.endsWith(".docx")) {
      textContent.value = await readDocxFile(file);
    } else {
      alert("不支持的文件格式，请上传 .txt 或 .docx 文件");
      return;
    }
    audioStore.text = textContent.value;
  } catch (e) {
    console.error("文件读取失败：", e);
    alert("文件读取失败，请重试");
  }
};

// 读取文本文件
const readTxtFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// 读取 docx 文件
const readDocxFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      mammoth
        .extractRawText({ arrayBuffer: reader.result })
        .then((result) => resolve(result.value))
        .catch((error) => reject(error));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

// 语种列表
const languages = ["普通话", "英语", "日语", "韩语", "粤语", "四川话"];
const showOptions = ref(false); // 是否显示语种选项
const selectedLanguage = ref(""); // 当前选中的语种
const selectLanguage = (language) => {
  // 选择语种
  selectedLanguage.value = language;
  showOptions.value = false; // 选择后关闭选项
  audioStore.language = language; // 保存语种到 store
};

const showAudioUpload = ref(false); // 是否显示音频上传窗口
const selectRecordBgmusicAudio = ref(null); // 选择的录音、背景音乐、导入音频文件
const selectType = ref(null); // 选择的类型，record、bgmusic、audio

const handleRecord = () => {
  if (audioStore.audio) {
    const isConfirm = confirm("您已经上传了音频，是否覆盖？");
    if (!isConfirm) return;
    else {
      audioStore.audio = null;
      audioStore.rawAudio = null;
    }
  }

  showAudioUpload.value = true;
  selectType.value = "record";
  if (!audioStore.recordAudio) {
    isUpAudio.value = false;
    audioStore.rawRecordAudio = null;
  } else {
    isUpAudio.value = true;
    selectRecordBgmusicAudio.value = audioStore.recordAudio;
    if (!audioStore.rawRecordAudio)
      audioStore.rawRecordAudio = audioStore.recordAudio;
  }
};

const isUpAudio = ref(true); // 是否上传音频

const bgMusicFile = ref(null); // 背景音乐文件
const bgMusicFileUrl = ref(""); // 背景音乐文件url
const fileBgMusicInput = ref(null); // 上传背景音乐input

const handleImportBgMusic = () => {
  if (!audioStore.bgMusic) {
    fileBgMusicInput.value.click();
    audioStore.rawBgMusic = null;
  } else {
    showAudioUpload.value = true;
    selectRecordBgmusicAudio.value = audioStore.bgMusic;
    if (!audioStore.rawBgMusic)
      audioStore.rawBgMusic = audioStore.cloneFile(audioStore.bgMusic);
    console.log("11111", audioStore.rawBgMusic);

    isUpAudio.value = true;
    selectType.value = "bgmusic";
  }
};

const handleBgMusicFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    bgMusicFileUrl.value = reader.result;
    bgMusicFile.value = file;
    audioStore.bgMusic = file;
    handleImportBgMusic();
  };
};

const audioFile = ref(null); // 音频文件
const audioFileUrl = ref(""); // 音频文件url
const fileAudioInput = ref(null); // 上传音频input

const handleImportAudio = () => {
  if (audioStore.recordAudio) {
    const isConfirm = confirm("您已经上传了录音，是否覆盖？");
    if (!isConfirm) return;
    else {
      audioStore.recordAudio = null;
      audioStore.rawRecordAudio = null;
    }
  }

  if (!audioStore.audio) {
    fileAudioInput.value.click();
    audioStore.rawAudio = null;
  } else {
    showAudioUpload.value = true;
    selectRecordBgmusicAudio.value = audioStore.audio;
    if (!audioStore.rawAudio) audioStore.rawAudio = audioStore.audio;
    isUpAudio.value = true;
    selectType.value = "audio";
  }
};

const handleAudioFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    audioFileUrl.value = reader.result;
    audioFile.value = file;
    audioStore.audio = file;
    handleImportAudio();
  };
};

// 音频播放
const handlePlayAudio = async () => {
  if(textContent.value.length === 0){
    alert("请输入配音内容");
    return;
  }
  if (audioState.value === "play") {
    audioState.value = "loading";
    let audio = audioStore.audio || audioStore.recordAudio;
    console.log("audio", audio);
    
    let prompt_text = "";
    if (!audio) {
      audio = await getAudioOrImg(audioStore.selectCharacter.audioPath);
      prompt_text = audioStore.selectCharacter.content
    } else prompt_text = await recognizeAudioContent(audio);

    console.log("prompt_text", prompt_text);

    let cloneAudioM3u8 = await getCloneAudio(audio, textContent.value, prompt_text);
    let cloneAudioUrl = cloneAudioM3u8[0].url;
    // console.log("cloneAudioM3u8", cloneAudioM3u8[0]);
    console.log("cloneAudioUrl", cloneAudioUrl);
    
    const hls = new Hls();
    hls.loadSource(cloneAudioUrl);
    hls.attachMedia(audioPlayer.value);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      audioPlayer.value.play();
      console.log("加载成功");
    });
    hls.on(Hls.Events.ERROR, (event, data) => {
      console.log("加载失败");
    });

    audioState.value = "pause"
  } else {
    audioState.value = "play"
  }
  audioPlayer.value.addEventListener("ended", () => {
    audioPlayer.value.pause();
    audioState.value = "play"; // 播放结束后状态重置为 play
  });
};
</script>

<style lang="scss" scoped></style>


