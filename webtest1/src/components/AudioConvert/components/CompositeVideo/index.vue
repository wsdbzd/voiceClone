<template>
  <div class="composite-video">

    <div class="composite-video-container">

      <div class="composite-video-loading" v-if="!videoStore.compositeVideoUrl">
        <div>合成中，请稍候</div>
        <div>
          <img src="./image/loading.gif" alt="" />
        </div>
      </div>

      <div class="composite-video-content" v-if="videoStore.compositeVideoUrl">
        <div class="video">
            <video src="../../video/video.mp4" controls></video>
        </div>
        <div class="btn">
            <button @click="makeVideo">继续制作</button>
            <button @click="downloadVideo">下载视频</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import "./index.scss";
import { ref } from "vue";
import { useVideoStore } from "../../../../stores/video";

const videoStore = useVideoStore();

const makeVideo = () => {
    videoStore.step = 0;
    videoStore.video = null
    videoStore.videoUrl = null
    videoStore.caption = null
    videoStore.audio = null
    videoStore.audioUrl = null
    videoStore.compositeVideo = null
    videoStore.compositeVideoUrl = null
}

const downloadVideo = () => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'video.mp4';  // 自定义下载文件名
    document.body.appendChild(link); // 防止 Firefox 中无法触发
    link.click();
    document.body.removeChild(link); // 清理 DOM，避免残留
}
</script>

<style lang="scss" scoped></style>
