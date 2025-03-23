<template>
  <div class="upload-video">
    <div
      class="upload-video-container"
      @dragover.prevent="handleDragOver"
      @dragleaver.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
      @click="handleClick"
    >
      <div class="content">
        <div><h3>拖拽文件</h3></div>
        <div><h3>或</h3></div>
        <div><h3>点击上传</h3></div>
        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          style="display: none"
          @change="handleFileSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { ref } from "vue";
import { useVideoStore } from "../../../../stores/video";

const fileInput = ref(null);
const videoStore = useVideoStore();

const handleClick = () => {
    fileInput.value.click();
}

// 拖拽进入时的样式变化
const handleDragOver = (event) => {
    event.currentTarget.classList.add('drag-over');
};

// 拖拽离开时移除样式
const handleDragLeave = (event) => {
    event.currentTarget.classList.remove('drag-over');
};

// 点击上传文件
const handleFileSelect = (event) => {
    const files = event.target.files;
    handleFiles(files);
};

// 处理文件逻辑
const handleFiles = (files) => {
    if (!files.length) return;

    const file = files[0];
    videoStore.video = file;
    videoStore.videoUrl = URL.createObjectURL(file);
    
    if (!file.type.startsWith('video/')) {
        alert('请选择一个有效的视频文件！');
        return;
    }
};

// 拖拽上传
const handleDrop = (event) => {
    event.currentTarget.classList.remove('drag-over');
    const files = event.dataTransfer.files;
    handleFiles(files);
};

</script>

<style lang="scss" scoped></style>
