<template>
  <div ref="container" class="canvas-container" @dragover.prevent @drop="handleDrop">
    <!-- 元素属性 -->
    <div class="operation">
      <!-- 画布的属性 -->
      <div class="canvasAttribute">
        <h3>视频属性</h3>

        <!-- 添加背景图片 -->
        <div class="backgroundImage">
          <label>
            <span>背景图片： </span>
            <input v-if="!backgroundImage" type="file" @change="handleBackgroundUpload" accept="image/*" />
            <button v-if="backgroundImage" @click="cancelBackground">取消背景</button>
          </label>
        </div>

        <!-- 视频宽高比 -->
        <div class="aspectRatio">
          <label>
            <span>视频宽高比：</span>
            <input type="number" v-model="aspectRatioWidth" /> :
            <input type="number" v-model="aspectRatioHeight" />
            (默认16 : 9)
          </label>
        </div>

        <!-- 角色配音 -->
        <div class="voiceover">
          <label>
            <span>角色配音： </span>
            <button @click="audioStore.isCloseAudioList = false">选择角色</button>
            <span :style="{ marginLeft: '-30px' }">
              {{ audioStore.selectCharacter? audioStore.selectCharacter.name : "未选择角色" }}
            </span>
          </label>
        </div>

        <!-- 添加元素 -->
        <div class="addElement">
          <label>
            <span>类型： </span>
            <select v-model="selectElementType">
              <option value="text">文本</option>
              <option value="image">图片</option>
              <option value="ppt">PPT</option>
              <option value="caption">字幕</option>
            </select>
            <button @click="addElement">添加</button>
          </label>
        </div>
      </div>

      <!-- 画布里元素的属性 -->
      <div class="elementAttribute">
        <h3 v-if="canvasStore.element">元素属性</h3>
        <ElementAttribute></ElementAttribute>
      </div>

      <!-- 合成按钮 -->
      <div class="compose">
        <button @click="goToMakePPT">合成</button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas" ref="canvas" :style="canvasStyle">
      <!-- 背景图片 -->
      <div v-if="backgroundImage" class="background" :style="backgroundStyle"></div>

      <!-- 画布元素 -->
      <CanvasElement v-for="element in elements" :key="element.id" :element="element" :container="canvasRect" />
    </div>

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

  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, onBeforeUnmount } from "vue";
import CanvasElement from "./CanvasElement.vue";
import ElementAttribute from "./ElementAttribute.vue";
import { useCanvasStore } from "../../stores/canvas";
import AudioAndList from "../AudioAndList/index.vue"
import { useAudioStore } from "../../stores/audio.js";
import { useRouter } from 'vue-router';
import './index.scss'

const router = useRouter();
const showSelectVoiceover = ref(false);
const audioStore = useAudioStore();

// 画布元素数据格式示例
const elements = ref([
  {
    id: 1,
    type: "image",
    file: "",
    src: "",
    x: 860,
    y: 200,
    width: 200,
    height: 200,
  },
  {
    id: 2,
    type: "ppt",
    file: "",
    src: "",
    x: 40,
    y: 40,
    width: 800,
    height: 450,
  },
  {
    id: 3,
    type: "caption",
    content: "字幕在此显示",
    x: 40,
    y: 520,
    width: 1000,
    height: 70,
    // fontSize: 16,
    // fontColor: "#333",
    // fontFamily: "Arial",
    // fontWeight: "normal",
    // fontStyle: "normal",
  },
  // 更多元素...
]);

let elementIds = 4;
const elementTypes = {
  text: {
    id: 0,
    type: "text",
    content: "双击更改文本内容",
    x: 100,
    y: 50,
    width: 200,
    height: 100,
    // fontSize: 16,
    // fontColor: "black",
    // fontFamily: "Arial",
    // fontWeight: "normal",
    // fontStyle: "normal",
  },
  image: {
    id: 0,
    type: "image",
    file: "",
    src: "",
    x: 790,
    y: 200,
    width: 230,
    height: 230,
  },
  ppt: {
    id: 0,
    type: "ppt",
    file: "",
    src: "",
    x: 40,
    y: 40,
    width: 700,
    height: 350,
  },
  caption: {
    id: 0,
    type: "caption",
    content: "可调整字幕的位置和大小",
    x: 40,
    y: 420,
    width: 700,
    height: 100,
    // fontSize: 16,
    // fontColor: "#333",
    // fontFamily: "Arial",
    // fontWeight: "normal",
    // fontStyle: "normal",
  }
}

const canvasStore = useCanvasStore();
const selectElementType = ref("text"); // 元素类型
const canvas = ref(null);
const canvasRect = reactive({
  width: 0,
  height: 0,
});
const container = ref(null);
const backgroundImage = ref(null);
const aspectRatioWidth = ref(16);
const aspectRatioHeight = ref(9);

const handleKeydown = (e) => {
  if (!canvasStore.element) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      let el = canvasStore.element;
      canvasStore.element = null;
      elements.value = elements.value.filter((e) => e.id !== el.id);
    }
}

onMounted(() => {
  canvas.value = document.querySelector(".canvas");
  container.value = document.querySelector(".canvas-container");
  canvasRect.width = container.value.offsetWidth * 0.7;
  canvasRect.height = canvasRect.width / aspectRatioWidth.value * aspectRatioHeight.value;
  console.log("画布宽高", canvasRect.width, canvasRect.height);

  audioStore.isCloseAudioList = true; // 默认关闭音频列表

  document.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
}) 

// canvas 样式
const canvasStyle = computed(() => {
  if (!container.value || !canvasRect.height) {
    return {}; // 返回空样式，避免错误
  }

  const aspectRatio = aspectRatioWidth.value / aspectRatioHeight.value;
  const maxWidth = container.value.offsetWidth * 0.7; // 假设画布最大宽度为屏幕宽度的70%
  const maxHeight = container.value.offsetHeight; // 计算画布最大高度
  let width = 0;
  let height = 0;

  if (aspectRatio >= 1) {
    width = maxWidth;
    height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  } else {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
  };
})

// 处理背景图片上传
const handleBackgroundUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      backgroundImage.value = e.target.result; // 将图片转换为 Base64 URL
    };
    reader.readAsDataURL(file);
  }
}

// 背景图片样式
const backgroundStyle = computed(() => {
  if (!backgroundImage.value) return {};

  return {
    backgroundImage: `url(${backgroundImage.value})`,
    backgroundSize: "cover", // 使背景图片布满整个画布
    backgroundPosition: "center", // 居中显示
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 0, // 确保背景在画布元素的下方
  };
});

// 添加元素
const addElement = () => {
  let el = { ...elementTypes[selectElementType.value] };
  el.id = ++elementIds;
  elements.value.push(el);
  console.log("添加元素", el);
  console.log("所有元素", elements.value);

}

// 取消背景图片
const cancelBackground = (e) => {
  e.preventDefault();
  backgroundImage.value = null;
}

// 获取所有元素信息
const getElementsData = () => {
  return elements.value.map((el) => ({
    id: el.id,
    type: el.type,
    file: el.file,
    src: el.src,
    content: el.content,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    ratioX: el.x / canvasRect.width,
    ratioY: el.y / canvasRect.height,
    ratioWidth: el.width / canvasRect.width,
    ratioHeight: el.height / canvasRect.height
  }));
};

const goToMakePPT = () => {
  canvasStore.elements = getElementsData();
  canvasStore.backgroundImgUrl = backgroundImage.value;
  router.push('/makePPT');
}
</script>

<style lang="scss" scoped></style>
