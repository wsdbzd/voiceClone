<template>
  <div class="ppt-container">
    <!-- 左侧 PPT 页面缩略图 -->
    <div class="thumbnails">
      <div
        v-for="(img, index) in imageList"
        :key="index"
        class="thumbnail-item"
        @click="handleSelectPPTImage(index)"
        :style="{
          backgroundImage: `url(${backgroundImgUrl})`,
          backgroundSize: 'cover',
        }"
      >
        <div
          v-for="(el, index) in elements"
          :key="index"
          :style="smallItemStyle(el)"
          class="item"
        >
          <img v-if="el.type === 'image'" :src="el.src" alt="" />
          <img v-if="el.type === 'ppt'" :src="img" alt="" />
          <div v-if="el.type === 'caption'" class="item-caption">
            {{ el.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧 PPT 画布 -->
    <div class="preview">
      <div
        class="canvas-box"
        :style="{
          backgroundImage: `url(${backgroundImgUrl})`,
          backgroundSize: 'cover',
        }"
      >
        <div
          v-for="(el, index) in elements"
          :key="index"
          :style="itemStyle(el)"
          class="item"
        >
          <img v-if="el.type === 'image'" :src="el.src" alt="" />
          <img
            v-if="el.type === 'ppt'"
            :src="imageList[selectePPTImgIndex]"
            alt=""
          />
          <div v-if="el.type === 'caption'" class="item-caption">
            {{ el.content }}
          </div>
        </div>
      </div>
      <div class="input-box">
        <textarea
          v-if="textContents[selectePPTImgIndex]"
          v-model="textContents[selectePPTImgIndex].content"
          placeholder="输入文字"
        ></textarea>
        <div class="tips" v-if="textContents[selectePPTImgIndex]">
          <div>
            字数：{{ textContents[selectePPTImgIndex].content.length }} / 500
          </div>
          <div><button @click="compositeVideo">合成视频</button></div>
        </div>
      </div>
    </div>

    <!-- 合成视频动画以及视频播放器 -->
    <div class="loading-video-box" v-if="compositeVideoState !== 'idle'">
      <div class="loading-box" v-if="compositeVideoState === 'loading'">
        <div>正在合成视频中，预计 <b>3</b> 分钟</div>
        <img src="./video/loading.gif" alt="">
      </div>

      <div class="video-box" v-if="compositeVideoState ==='success'">
        <div class="close" @click="compositeVideoState = 'idle'">x</div>
        <video src="./video/compositeVideo.mp4" controls></video>
      </div>

      <div class="overlay"></div>
    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { ref, onMounted, computed } from "vue";
import { useCanvasStore } from "../../stores/canvas";

const canvasStore = useCanvasStore();
const elements = ref([]);
const images = import.meta.glob("./image/*.JPG", { eager: true }); // 直接导入图片 URL
const imageList = ref(Object.values(images).map((img) => img.default)); // 取出默认导出的图片路径
const textContents = ref([]);
const inputText = ref("");
const smallContainerWidth = 288;
const smallContainerHeight = 162;
const containerWidth = 800;
const containerHeight = 450;
const selectePPTImgIndex = ref(0);
const backgroundImgUrl = canvasStore.backgroundImgUrl;
const compositeVideoState = ref('idle'); // idle, loading, success

onMounted(async () => {
  elements.value = canvasStore.elements;
  // console.log('PPT 页面元素:', elements.value);
  const textFiles = import.meta.glob("./text/*.txt", { as: "raw" });
  const loadedTexts = [];
  for (const path in textFiles) {
    const content = await textFiles[path](); // 加载文本内容
    loadedTexts.push({ path, content });
  }
  textContents.value = loadedTexts;
  // console.log("加载的文本内容:", textContents.value);
});

const smallItemStyle = (item) => {
  let x = smallContainerWidth * item.ratioX;
  let y = smallContainerHeight * item.ratioY;
  let width = smallContainerWidth * item.ratioWidth;
  let height = smallContainerHeight * item.ratioHeight;
  // console.log('itemStyle:', item, x, y, width, height);

  return {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
};

const itemStyle = (item) => {
  let x = containerWidth * item.ratioX;
  let y = containerHeight * item.ratioY;
  let width = containerWidth * item.ratioWidth;
  let height = containerHeight * item.ratioHeight;

  return {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
};

const handleSelectPPTImage = (index) => {
  selectePPTImgIndex.value = index;
};

const compositeVideo = () => {
  compositeVideoState.value = 'loading';
  setTimeout(() => {
    compositeVideoState.value ='success';
  }, 5000);
}
</script>

<style lang="scss" scoped>

</style>
