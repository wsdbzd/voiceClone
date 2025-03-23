<template>
  <div class="audioUpload">
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      style="display: none"
    />

    <div class="upTips">
      <div class="left">参考音频(请上传≤15秒的.wav/.mp3)</div>
      <div v-show="audio" class="downloadAndReset">
        <div class="download">
          <img @click="downloadAudio" src="./image/download.png" alt="">
          <!-- <button @click="downloadAudio">下载音频</button> -->
        </div>
        <div class="right" @click="resetAudio">x</div>
      </div>
    </div>

    <div
      v-show="isUpAudio"
      class="waveform-container"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :class="{
        dragover: isDragging && !audio,
        'hover-effect': !audio,
        'cursor-pointer': !audio,
      }"
    >
      <p v-if="!audio">拖拽音频文件或点击上传</p>

      <div v-show="audio" class="waveform">
        <div
          ref="waveform"
          class="waveform-canvas"
          @mousedown="startPointerDrag"
          @mouseup="stopPointerDrag"
          @mouseleave="stopPointerDrag"
        >
          <div
            v-if="isTrimming"
            class="resizable"
            ref="resizable"
            :style="resizableStyle"
            @mousedown="handleMouseDown"
          >
            <div class="edge left"></div>
            <div class="edge right"></div>
          </div>
        </div>

        <div class="timeline">
          <div>{{ currentTime }}</div>
          <div>{{ totalDuration }}</div>
        </div>
        <div class="controls">
          <div class="left">
            <!-- <button @click="toggleMute">
              {{ isMuted ? "取消静音" : "静音" }}
            </button> -->
            <div @click="toggleMute">
              <img v-if="!isMuted" src="./image/sound.png" />
              <img v-if="isMuted" src="./image/closeSound.png" />
            </div>
            <button @click="toggleSpeed">
              {{ speedOptions[currentSpeedIndex] }}x
            </button>
          </div>

          <div class="middle">
            <!-- <button @click="backward"><<</button>
            <button @click="() => wavesurfer.playPause()">
              {{ isPlaying ? "暂停" : "播放" }}
            </button>
            <button @click="forward">>></button> -->
            <div @click="backward" class="middle-item">
              <img src="./image/leftShift.png" alt="">
            </div>
            <div class="middle-item" @click="() => wavesurfer.playPause()">
              <img v-if="!isPlaying" src="./image/play.png" alt="">
              <img v-if="isPlaying" src="./image/pause.png" alt="">
            </div>
            <div @click="forward" class="middle-item">
              <img src="./image/rightShift.png" alt="">
            </div>
          </div>

          <div v-show="!isTrimming" class="right">
            <!-- <button @click="restoreAudio">还原</button> -->
            <div @click="restoreAudio" class="right-item">
              <img src="./image/restore.png" alt="">
            </div>
            <!-- <button @click="() => (isTrimming = !isTrimming)">裁剪</button> -->
            <div @click="() => (isTrimming = !isTrimming)" class="right-item">
              <img src="./image/trim.png" alt="">
            </div>
          </div>

          <div v-show="isTrimming" class="right">
            <button @click="trimAudio">确认裁剪</button>
            <button @click="cancelTrim">取消</button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="!isUpAudio" class="record-container">
      <div>
        <button @click="toggleRecording" :class="{ recording: isRecording }">
          <span v-if="!isRecording">点击录音</span>
          <span v-if="isRecording">录音中</span>
        </button>
      </div>
    </div>

    <!-- <div class="uploadOrRecord">
      <button
        @click="
          () => {
            stopRecording();
            isUpAudio = true;
          }
        "
      >
        上传
      </button>
      <button
        @click="
          () => {
            resetAudio();
            isUpAudio = false;
          }
        "
      >
        录音
      </button>
    </div> -->
  </div>
</template>

<script setup>
import "./index.scss";
import { onMounted, ref } from "vue";
import WaveSurfer from "wavesurfer.js";
import { computed } from "vue";
import { useAudioStore } from "../../stores/audio.js";
import { useVideoStore } from "../../stores/video.js";
import { changeAudioFormat } from '../../api/api.js'

const audioStore = useAudioStore();
const videoStore = useVideoStore();

const props = defineProps({
  audio: {
    type: Object,
    default: null,
  },
  isUpAudio: {
    type: Object,
    default: true,
  },
  selectType: {
    type: Object,
    default: null
  }
})

const selectType = ref(props.selectType); // 选择类型
const isUpAudio = ref(props.isUpAudio); // 是否上传音频
const audio = ref(props.audio); // 音频文件
const rawAudio = ref(null);
const waveform = ref(null);
const fileInput = ref(null);
const isDragging = ref(false); // 拖拽状态
const isPlaying = ref(false);
const currentTime = ref("0:00");
const totalDuration = ref("0:00");
const isMuted = ref(false); // 静音状态
const speedOptions = [1, 1.5, 2, 0.5]; // 倍速选项
const currentSpeedIndex = ref(0); // 当前倍速索引
const startTime = ref(0); // 裁剪起始时间
const endTime = ref(0); // 裁剪结束时间
const isTrimming = ref(false); // 是否正在裁剪
const isPointerDragging = ref(false); // 是否正在拖动指针
let wavesurfer = null;

const waveformWidth = ref(0); // 波形图宽度
const resizable = ref(null); // 可拖动区域
const isResizingLeft = ref(false); // 是否正在左边拖动
const isResizingRight = ref(false); // 是否正在右边拖动
const isResizingDragging = ref(false); // 是否正在拖动可拖动区域
const startX = ref(0);
const startLeft = ref(0);
const startWidth = ref(0);
const leftPercentage = ref(12.5); // 初始位置
const widthPercentage = ref(25); // 初始宽度
const rightPercentage = computed(
  () => leftPercentage.value + widthPercentage.value
);
const resizableStyle = computed(() => ({
  left: `${leftPercentage.value}%`,
  width: `${widthPercentage.value}%`,
}));

const mediaRecorder = ref(null); // 录音对象
const audioChunks = ref([]); // 录音片段
const audioUrl = ref(null); // 录音文件 URL
const isRecording = ref(false); // 录音状态
const audioStream = ref(null); // 录音流

onMounted(() => {
  if (audio.value) {
    initWaveform(audio.value);
  }
});

// 切换录音状态
const toggleRecording = () => {
  isRecording.value ? stopRecording() : startRecording();
};

// 开始录音
const startRecording = async () => {
  try {
    audioStream.value = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    mediaRecorder.value = new MediaRecorder(audioStream.value, {
      mimeType: "audio/webm;codecs=opus",
    });

    mediaRecorder.value.ondataavailable = (e) => {
      audioChunks.value.push(e.data);
    };

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: "audio/webm" });

      // console.log("audioFile", audioFile);
      
      initWaveform(audioBlob);

      // // 将 Blob 转换为 File 对象
      const audioFile = new File([changeAudioFormat(audioBlob)], "record.wav", {
        type: "audio/wav",
      });
      audioStore.recordAudio = audioFile;
      audioChunks.value = [];
    };

    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (err) {
    console.error("录音权限被拒绝:", err);
  }
};

// 停止录音
const stopRecording = () => {
  if (!mediaRecorder.value) return;
  mediaRecorder.value.stop();
  audioStream.value.getTracks().forEach((track) => track.stop());
  isRecording.value = false;
  isUpAudio.value = true;
};

// 下载音频
const downloadAudio = () => {
  const link = document.createElement("a");
  link.href = audioUrl.value;
  link.download = "audio.wav";
  link.click();
};

// 裁剪方块的鼠标按下操作
function handleMouseDown(event) {
  // 鼠标在可拖动区域按下
  waveformWidth.value = waveform.value.offsetWidth; // 记录波形图宽度
  const rect = resizable.value.getBoundingClientRect();
  const localX = event.clientX - rect.left;
  const edgeThreshold = 5; // 边缘阈值

  // 判断操作类型
  if (localX < edgeThreshold) {
    isResizingLeft.value = true;
  } else if (localX > rect.width - edgeThreshold) {
    isResizingRight.value = true;
  } else {
    isResizingDragging.value = true;
  }

  // 记录初始值
  startX.value = event.clientX;
  startLeft.value = leftPercentage.value;
  startWidth.value = widthPercentage.value;

  // 添加全局事件监听
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  event.preventDefault();
}

// 裁剪方块的鼠标移动操作
function handleMouseMove(event) {
  // 鼠标在可拖动区域移动
  if (
    !isResizingDragging.value &&
    !isResizingLeft.value &&
    !isResizingRight.value
  )
    return;

  const deltaX = event.clientX - startX.value;
  const deltaPercent = (deltaX / waveformWidth.value) * 100; // 计算百分比变化

  // 拖动处理
  if (isResizingDragging.value) {
    const newLeft = startLeft.value + deltaPercent;
    leftPercentage.value = Math.max(
      0,
      Math.min(newLeft, 100 - widthPercentage.value)
    );
  }
  // 调整左边
  else if (isResizingLeft.value) {
    const newLeft = startLeft.value + deltaPercent;
    const newWidth = startWidth.value - deltaPercent;

    if (newLeft >= 0 && newWidth >= 1) {
      // 最小宽度1%
      leftPercentage.value = newLeft;
      widthPercentage.value = newWidth;
    }
  }
  // 调整右边
  else if (isResizingRight.value) {
    const newWidth = startWidth.value + deltaPercent;
    const maxWidth = 100 - leftPercentage.value;

    if (newWidth >= 1 && newWidth <= maxWidth) {
      widthPercentage.value = newWidth;
    }
  }
}

// 裁剪方块的鼠标释放操作
function handleMouseUp() {
  // 鼠标在可拖动区域释放
  isResizingDragging.value = false;
  isResizingLeft.value = false;
  isResizingRight.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
}

// 取消裁剪
function cancelTrim() {
  isTrimming.value = !isTrimming.value;
  leftPercentage.value = 12.5;
  widthPercentage.value = 25;
}

// 确认裁剪
async function trimAudio() {
  if (!wavesurfer || !wavesurfer.backend || !wavesurfer.backend.buffer) {
    console.error("音频未加载或无法裁剪");
    return;
  }

  startTime.value = (leftPercentage.value / 100) * wavesurfer.getDuration(); // 计算裁剪起始时间
  endTime.value = (rightPercentage.value / 100) * wavesurfer.getDuration(); // 计算裁剪结束时间

  const audioBuffer = wavesurfer.backend.buffer; // 获取 AudioBuffer
  const sampleRate = audioBuffer.sampleRate; // 采样率
  const startSample = Math.floor(startTime.value * sampleRate); // 开始样本索引
  const endSample = Math.floor(endTime.value * sampleRate); // 结束样本索引

  // 🎯 创建新的 AudioBuffer（长度为裁剪部分）
  const newBuffer = wavesurfer.backend.ac.createBuffer(
    audioBuffer.numberOfChannels,
    endSample - startSample,
    sampleRate
  );

  // 复制数据
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const oldData = audioBuffer.getChannelData(channel);
    const newData = newBuffer.getChannelData(channel);
    newData.set(oldData.slice(startSample, endSample));
  }

  // 🔄 重新加载裁剪后的音频
  wavesurfer.loadDecodedBuffer(newBuffer);
  cancelTrim();
  wavesurfer.seekTo(0);
  console.log(`音频已裁剪: ${startTime.value}s ~ ${endTime.value}s`);

  // 🎯 将 AudioBuffer 转换为 Blob
  const audioBlob = await audioBufferToBlob(newBuffer);

  // 💾 创建文件并下载
  const audioFile = new File([audioBlob], "trimmed-audio.wav", {
    type: "audio/wav"
  });

  if(selectType.value === 'bgmusic')
    audioStore.bgMusic = audioFile; // 保存背景音乐
  else if(selectType.value === 'audio')
    audioStore.audio = audioFile; // 保存音频文件
  else if(selectType.value ==='record')
    audioStore.recordAudio = audioFile; // 保存录音文件
  else if(selectType.value === 'videoAudio')
    videoStore.audio = audioFile; // 保存视频音频文件
  else if(selectType.value === 'videoRecord')
    videoStore.record = audioFile; // 保存视频录音文件
}

// 音频缓冲区转 Blob 的辅助函数
async function audioBufferToBlob(audioBuffer) {
  const offlineCtx = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const bufferSource = offlineCtx.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(offlineCtx.destination);
  bufferSource.start();

  const renderedBuffer = await offlineCtx.startRendering();

  // 转换为 WAV 格式
  return encodeWAV(renderedBuffer);
}

// WAV 编码函数
function encodeWAV(audioBuffer) {
  const numOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length * numOfChannels * 2 + 44; // 每个样本 16-bit (2 字节)
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  // WAV 文件头
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + audioBuffer.length * numOfChannels * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChannels * 2, true);
  view.setUint16(32, numOfChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit PCM
  writeString(view, 36, "data");
  view.setUint32(40, audioBuffer.length * numOfChannels * 2, true);

  // PCM 数据
  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i] * 32767;
      view.setInt16(offset, sample < 0 ? Math.max(sample, -32768) : Math.min(sample, 32767), true);
      offset += 2;
    }
  }

  return new Blob([view], { type: "audio/wav" });
}

// 字符串写入工具
function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// 还原音频
function restoreAudio(event) {
  resetAudio(event);

  let tmpAudio = null;

  if(selectType.value === 'bgmusic'){
    audioStore.bgMusic = audioStore.cloneFile(audioStore.rawBgMusic);
    tmpAudio = audioStore.rawBgMusic;
  } else if(selectType.value === 'audio'){
    audioStore.audio = audioStore.rawAudio; 
    tmpAudio = audioStore.rawAudio;
  } else if(selectType.value ==='record'){
    audioStore.recordAudio = audioStore.rawRecordAudio; 
    tmpAudio = audioStore.rawRecordAudio;
  }

  console.log("tmpAudio: ", tmpAudio);
  console.log("selectType: ", selectType.value);
  console.log("audioStore.rawBgMusic: ", audioStore.rawBgMusic);
  console.log("audioStore.bgMusic: ", audioStore.bgMusic);

  initWaveform(tmpAudio);
}

// 重置音频
function resetAudio(event) {
  if (event) event.stopPropagation();
  if (wavesurfer) {
    wavesurfer.destroy(); // 销毁 WaveSurfer 实例
    wavesurfer = null; // 清空 WaveSurfer 实例
  }
  
  if(selectType.value === 'bgmusic')
    audioStore.bgMusic = null; // 清空背景音乐
  else if(selectType.value === 'audio')
    audioStore.audio = null; // 清空音频文件
  else if(selectType.value === 'record')
    audioStore.recordAudio = null; // 清空录音文件
  
  audio.value = null; // 清空音频文件
  isPlaying.value = false; // 重置播放状态
  isMuted.value = false; // 重置静音状态
  currentTime.value = "0:00"; // 重置当前时间
  totalDuration.value = "0:00"; // 重置总时长
  currentSpeedIndex.value = 0; // 重置倍速索引
}

// 切换倍速
function toggleSpeed() {
  currentSpeedIndex.value = (currentSpeedIndex.value + 1) % speedOptions.length;
  const newSpeed = speedOptions[currentSpeedIndex.value];
  wavesurfer.setPlaybackRate(newSpeed);
}

// 切换静音
function toggleMute() {
  isMuted.value = !isMuted.value; // 切换静音状态
  wavesurfer.setVolume(isMuted.value ? 0 : 1); // 设置音量
}

// 格式化时间
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// 拖拽进入
function handleDragOver(event) {
  event.preventDefault();
  isDragging.value = true;
}

// 拖拽离开
function handleDragLeave(event) {
  event.preventDefault();
  isDragging.value = false;
}

// 处理拖拽文件
function handleDrop(event) {
  handleDragOver(event);
  isDragging.value = false; // 拖拽结束，取消拖拽状态
  if (audio.value) return;
  const file = event.dataTransfer.files[0];
  if (file && file.type.match("audio.*")) {
    initWaveform(file);
  } else {
    alert("请上传有效的音频文件");
  }
}

// 初始化波形
function initWaveform(file) {
  if (wavesurfer) wavesurfer.destroy();

  wavesurfer = WaveSurfer.create({
    container: waveform.value,
    waveColor: "#ADD8E6",
    progressColor: "#007bff",
    cursorColor: "#007bff",
    height: 100,
    barWidth: 3,
    normalize: true,
    responsive: true,
    backend: "WebAudio", // 确保使用 WebAudio
    interact: true, // 启用交互功能
  });

  if(selectType.value === 'videoAudio')
    useVideoStore.audio = file; // 保存音频文件
  else if(selectType.value === 'videoRecord')
    useVideoStore.record = file; // 保存录音文件

  audio.value = file;
  rawAudio.value = file;
  audioUrl.value = URL.createObjectURL(file);
  wavesurfer.load(audioUrl.value);

  // 添加事件监听器
  waveform.value.addEventListener("mousemove", handlePointMouseMove);

  // 监听音频加载完成事件
  wavesurfer.on("ready", function () {
    totalDuration.value = formatTime(wavesurfer.getDuration());
  });

  // 监听播放进度
  wavesurfer.on("audioprocess", function () {
    currentTime.value = formatTime(wavesurfer.getCurrentTime());
  });

  // 监听播放状态变化
  wavesurfer.on("play", function () {
    isPlaying.value = true;
  });

  wavesurfer.on("pause", function () {
    isPlaying.value = false;
  });

  // 监听点击波形图事件
  wavesurfer.on("seek", function (progress) {
    const time = progress * wavesurfer.getDuration(); // 转换为时间
    currentTime.value = formatTime(time); // 更新显示的时间
  });
}

// 鼠标在波形图上移动
function handlePointMouseMove(event) {
  if (isPointerDragging.value) {
    const rect = waveform.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const percent = mouseX / rect.width;
    wavesurfer.seekTo(percent); // 根据鼠标位置更新音频播放进度
  }
}

// 开始拖动指针
function startPointerDrag() {
  if (isResizingDragging.value || isResizingLeft.value || isResizingRight.value)
    return;
  isPointerDragging.value = true;
}

// 停止拖动指针
function stopPointerDrag() {
  isPointerDragging.value = false;
}

// 前进1秒
function forward() {
  const oldTime = wavesurfer.getCurrentTime();
  const newTime = Math.min(oldTime + 1, wavesurfer.getDuration()); // 前进 1 秒
  wavesurfer.seekTo(newTime / wavesurfer.getDuration()); // 跳转到新时间点
  currentTime.value = formatTime(newTime); // 更新显示的时间
}

// 后退1秒
function backward() {
  const oldTime = wavesurfer.getCurrentTime();
  const newTime = Math.max(oldTime - 1, 0); // 后退 1 秒，确保不小于 0
  wavesurfer.seekTo(newTime / wavesurfer.getDuration()); // 跳转到新时间点
  currentTime.value = formatTime(newTime); // 更新显示的时间
}

// 处理文件上传
function handleFileChange(event) {
  const file = event.target.files[0];
  if (file && file.type.match("audio.*")) {
    initWaveform(file);
  }
}

// 点击 div 上传文件
function handleClick() {
  if (!audio.value) fileInput.value.click();
}
</script>

<style lang="scss" scoped></style>

