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
          <div><button>合成视频</button></div>
        </div>
      </div>
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
</script>

<style lang="scss" scoped>
.ppt-container {
  display: flex;
  height: 100%;

  /* 左侧缩略图 */
  .thumbnails {
    width: 340px;
    background: #f0f0f0;
    // padding: 10px;
    // display: flex;
    // align-items: center;
    // justify-content: center;
    flex-direction: column;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px; // 滚动条宽度
    }

    &::-webkit-scrollbar-track {
      background: white; // 滚动条背景颜色
      /* 浅灰色背景 */
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #bbb; // 滚动条滑块颜色
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #888; // 鼠标悬停时颜色
    }

    .thumbnail-item {
      margin: 0 auto;
      width: 288px;
      height: 162px;
      margin-top: 15px;
      border: 1px solid #ddd;
      background: white;
      position: relative;
      border-radius: 5px;

      &:hover {
        border-color: black;
      }

      .item {
        // border: 1px solid black;

        img {
          width: 100%;
          height: 100%;
        }

        .item-caption {
          font-size: 10px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }
  }

  /* 右侧 PPT 画布 */
  .preview {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    flex-direction: column;

    .canvas-box {
      margin-top: 10px;
      width: 800px;
      height: 450px;
      background: #f9f9f9;
      position: relative;
      // border: 1px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 0 10px #ddd;

      .item {
        // border: 1px solid black;

        img {
          width: 100%;
          height: 100%;
        }

        .item-caption {
          text-align: center;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    .input-box {
      margin-top: 10px;
      width: 90%;
      flex: 1;
      background: #f9f9f9;
      // border: 1px solid #ddd;
      border-radius: 10px;
      box-shadow: 0 0 10px #ddd;
      position: relative;

      .tips {
        display: flex;
        align-items: center;
        justify-content: right;
        height: 50px;
        border-radius: 10px;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;

        div {
          margin-right: 15px;
        }

        button {
          width: 100px;
          height: 30px;
          border-radius: 5px;
          border: none;
          background-color: #cfe6ff;
          color: #007bff;
          font-size: medium;
          cursor: pointer;
          transition: all 0.2s ease-in-out;

          &:hover {
            background-color: #007bff;
            color: white;
          }
        }
      }

      textarea {
        border-radius: 10px;
        width: 100%;
        height: 100%;
        padding: 10px;
        font-size: large;
        border: none;
        outline: none;
        resize: none;
      }
    }
  }
}
</style>
