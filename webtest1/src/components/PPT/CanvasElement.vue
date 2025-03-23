<template>
  <div
    class="element"
    :style="elementStyle"
    @mousedown="startDrag"
    @mouseup="stopDrag"
  >
    <!-- 元素内容 -->
    <div class="content" @dblclick="handleDblClick">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        style="display: none"
      />

      <div class="image" v-if="element.type === 'image'">
        <span v-if="!fileUrl">拖拽或双击上传图片</span>
        <img
          v-if="fileUrl"
          :src="fileUrl"
          alt="图片"
          style="width: 100%; height: 100%; user-select: none; pointer-events: none; border-radius: 10px;"
        />
      </div>

      <div class="text" v-if="element.type === 'text'">
        <!-- 显示文本内容 -->
        <span v-if="!isEditing" :style="testStyle">{{ element.content }}</span>
        <!-- 编辑模式 -->
        <textarea
          ref="textarea"
          v-if="isEditing"
          v-model="editableContent"
          @blur="saveContent"
        ></textarea>
      </div>

      <div class="ppt" v-if="element.type === 'ppt'">
        <span v-if="!isUploaddingPPT && !fileUrl">拖拽或双击上传ppt</span>
        <span v-if="isUploaddingPPT">ppt加载中...</span>
        <img
          v-if="fileUrl"
          :src="fileUrl"
          alt="图片"
          style="width: 100%; height: 100%; user-select: none; pointer-events: none; border-radius: 10px;"
        />
      </div>

      <div class="caption" v-if="element.type === 'caption'" :style="captionStyle">
        {{ element.content }}
      </div>

    </div>

    <!-- 缩放手柄 -->
    <div class="resize-handle" @mousedown.stop="startResize"></div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, nextTick, onMounted } from "vue";
import { useCanvasStore } from "../../stores/canvas";
import { uploadPPT } from "../../api/api";
import './index.scss'

const props = defineProps({
  element: Object,
  container: Object,
});

const file = ref(null);
const fileUrl = ref(null);
const fileInput = ref(null);
const element = ref(props.element);
const container = ref(props.container);
const isEditing = ref(false);
const editableContent = ref(""); // 用于绑定编辑内容
const textarea = ref(null);
const canvasStore = useCanvasStore();
const isUploaddingPPT = ref(false);

onMounted(() => {
  // console.log("element.value", element.value);
  // console.log("container.value", container.value);
  
})

// 文本元素样式
const testStyle = computed(() => ({
  fontStyle: element.value.fontStyle,
  fontSize: element.value.fontSize + "px",
  color: element.value.fontColor,
  fontFamily: element.value.fontFamily,
  fontWeight: element.value.fontWeight,
}))

// 字幕元素样式
const captionStyle = computed(() => ({
  fontStyle: element.value.fontStyle,
  fontSize: element.value.fontSize + "px",
  color: element.value.fontColor,
  fontFamily: element.value.fontFamily,
  fontWeight: element.value.fontWeight,
}))

// 元素样式
const elementStyle = computed(() => ({
  position: "absolute",
  left: element.value.x + "px",
  top: element.value.y + "px",
  width: element.value.width + "px",
  height: element.value.height + "px",
  border: "2px solid #333",
  cursor: "move",
}));

// 拖拽逻辑
let isDragging = false;
let startX = 0;
let startY = 0;

const startDrag = (e) => {
  if(isEditing.value) return;
  handleClick();
  isDragging = true;
  startX = e.clientX - element.value.x;
  startY = e.clientY - element.value.y;
  window.addEventListener("mousemove", drag);
  window.addEventListener("mouseup", stopDrag);
};

// 元素拖拽
const drag = (e) => {
  if (!isDragging) return;

  let newX = e.clientX - startX;
  let newY = e.clientY - startY;

  // 计算最大允许的位置，防止超出容器
  const maxX = container.value.width - element.value.width;
  const maxY = container.value.height - element.value.height;

  // 限制拖动范围
  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  element.value.x = newX;
  element.value.y = newY;
};

const stopDrag = () => {
  isDragging = false;
  window.removeEventListener("mousemove", drag);
};

// 缩放逻辑
let isResizing = false;
let startWidth = 0;
let startHeight = 0;
let startResizeX = 0;
let startResizeY = 0;

const startResize = (e) => {
  e.preventDefault();
  isResizing = true;
  startWidth = element.value.width;
  startHeight = element.value.height;
  startResizeX = e.clientX;
  startResizeY = e.clientY;
  window.addEventListener("mousemove", resize);
  window.addEventListener("mouseup", stopResize);
};

// 元素缩放
const resize = (e) => {
  if (!isResizing) return;

  let newWidth = startWidth + (e.clientX - startResizeX);
  let newHeight = startHeight + (e.clientY - startResizeY);

  // 限制最小尺寸 50x50
  newWidth = Math.max(50, newWidth);
  newHeight = Math.max(50, newHeight);

  // 限制最大尺寸，防止超出 container 边界
  const maxWidth = container.value.width - element.value.x;
  const maxHeight = container.value.height - element.value.y;

  newWidth = Math.min(newWidth, maxWidth);
  newHeight = Math.min(newHeight, maxHeight);

  element.value.width = newWidth;
  element.value.height = newHeight;

  // emit('update:size', props.element.id, newWidth, newHeight);
};

const stopResize = () => {
  isResizing = false;
  window.removeEventListener("mousemove", resize);
};

const handleFileUpload = (e) => {
  const selectedFile = e.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;
    element.value.file = file.value;

    switch (element.value.type) {
      case "image":
        handleImageDbClick(e);
        break;
      case "ppt":
        handlePptDbClick(e);
        break;
    }
  }
};

// 双击事件
const handleDblClick = () => {
  if (element.value.type === "image" || element.value.type === "ppt")
    fileInput.value.click();
  else if (element.value.type === "text") handleTextDbClick();
};

// 双击图片上传事件
const handleImageDbClick = (e) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    fileUrl.value = e.target.result;
    element.value.src = fileUrl.value;
  }
  reader.readAsDataURL(file.value);
};

// 双击文本编辑事件
const handleTextDbClick = () => {
  isEditing.value = true;
  editableContent.value = element.value.content;
  nextTick(() => {
    textarea.value.focus();
  })
};

// 双击 ppt 上传事件
const handlePptDbClick = async (e) => {
  isUploaddingPPT.value = true;
  let data = await uploadPPT(file.value)
  let blob = new Blob([data], { type: "image/jpg" })
  let url = URL.createObjectURL(blob);
  fileUrl.value = url;
  element.value.src = fileUrl.value;
  isUploaddingPPT.value = false;
};

// 保存编辑内容
const saveContent = () => {
  isEditing.value = false;
  element.value.content = editableContent.value;
};

// 点击事件
const handleClick = () => {
  canvasStore.element = element.value;
  // console.log("element.value", canvasStore.element);
  
}
</script>

<style lang="scss" scoped>

</style>
