<template>
  <div class="element-attribute" v-if="canvasStore.element">

    <label>
      <span>宽度：</span>
      <input type="number" v-model="canvasStore.element.width" />
    </label>

    <label>
      <span>高度：</span>
      <input type="number" v-model="canvasStore.element.height" />
    </label>

    <label>
      <span>X坐标：</span>
      <input type="number" v-model="canvasStore.element.x" />
    </label>

    <label>
      <span>Y坐标：</span>
      <input type="number" v-model="canvasStore.element.y" />
    </label>

    <div v-if="canvasStore.element.type === 'text' || canvasStore.element.type === 'caption'">

      <!-- <label>
        <span>文本：</span>
        <input type="text" v-model="canvasStore.element.content" />
      </label> -->

      <!-- <label>
        <span>字体大小：</span>
        <input type="number" v-model="canvasStore.element.fontSize" />
      </label>

      <label>
        <span>字体颜色：</span>
        <input type="color" v-model="canvasStore.element.fontColor" />
      </label>

      <label>
        <span>字体粗细：</span>
        <select v-model="canvasStore.element.fontWeight">
          <option value="lighter">细体</option>
          <option value="normal">正常</option>
          <option value="bold">粗体</option>
        </select>
      </label> -->

      <!-- <label>
        <span>字体样式：</span>
        <select v-model="canvasStore.element.fontStyle">
          <option value="normal">正常</option>
          <option value="italic">斜体</option>
        </select>
      </label> -->

      <!-- <label>
        <span>字体类型：</span>
        <select v-model="canvasStore.element.fontFamily">
          <option value="Arial">Arial</option>
          <option value="Times New Roman, serif">Times New Roman</option>
        </select>
      </label> -->

    </div>

  </div>
</template>

<script setup>
import "./index.scss";
import { onMounted, ref } from "vue";
import { useCanvasStore } from "../../stores/canvas";

onMounted(() => {
  // canvasStore = useCanvasStore()
});

const canvasStore = useCanvasStore();
</script>
