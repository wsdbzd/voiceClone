<template>
  <div>
    <!-- 搜索框 -->
    <div class="character-list">
      <div class="search">
        <img src="./image/search.png" alt="" />
        <input type="text" v-model="searchText" placeholder="输入角色名称进行搜索" />
      </div>

      <!-- 筛选 -->
      <div class="filter">
        <div v-for="(filter, index) in filters" :key="index" :class="{ active: activeFilter === index }"
          @click="selectFilter(index)">
          {{ filter }}
        </div>
      </div>

      <!-- 角色列表 -->
      <div class="list">
        <!-- 动态渲染列表项 -->
        <div v-for="(item, index) in filterCharacterList" :key="index" class="list-item"
          :class="{ active: activeCharacter === index }" @click="selectCharacter(index)">
          <div class="item-img">
            <img :src="item.imgUrl" alt="角色头像">
          </div>
          <div class="item-info">
            <div class="name">{{ item.name }}</div>
            <div class="label">{{ item.tag }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import "./index.scss";
import { onMounted, ref } from "vue";
import { useAudioStore } from '../../stores/audio.js'
import { getAudiosInfo } from "../../api/api.js";

onMounted(async () => {
  // 获取角色列表数据
  if (audioStore.characterList.length) {
    characterList.value = audioStore.characterList;
  } else {
    characterList.value = await getAudiosInfo();
    audioStore.characterList = characterList.value;
  }

  // console.log("characterList: ", characterList.value);
  
  filterCharacterList.value = characterList.value;

  if(!audioStore.selectCharacter){
    audioStore.selectCharacter = characterList.value[0];
    audioStore.selectCharacterIndex = 0;
  } else {
    activeCharacter.value = audioStore.selectCharacterIndex;
  }
})

const searchText = ref(""); // 搜索框输入内容
const audioStore = useAudioStore();
const filters = ["普通话", "英语", "日语", "韩语", "粤语", "四川话", "天津话"]; // 筛选列表
const activeFilter = ref(null); // 当前选中的筛选项的索引

const selectFilter = (index) => { // 筛选选项点击处理函数
  activeFilter.value = activeFilter.value === index ? null : index;
  if (activeFilter.value === null) {
    filterCharacterList.value = characterList.value;
  } else {
    filterCharacterList.value = characterList.value.filter((item) => {
      return item.language === filters[activeFilter.value];
    });
  };
  selectCharacter(0);
}

const activeCharacter = ref(0); // 当前选中项的索引
const filterCharacterList = ref([]); // 筛选后的角色列表
const characterList = ref([]); // 角色列表

const selectCharacter = (index) => { // 角色列表项点击处理函数
  activeCharacter.value = index;
  audioStore.selectCharacter = filterCharacterList.value[index];
  audioStore.selectCharacterIndex = index;
};

import { watch } from "vue";

watch(searchText, (newValue) => {
  const searchTerm = newValue.trim().toLowerCase();
  if (searchTerm === "") {
    filterCharacterList.value = characterList.value;
    return;
  }

  // 根据筛选条件过滤
  let filteredList = filterCharacterList.value;

  if (activeFilter.value !== null) {
    filteredList = filteredList.filter(
      (item) => item.language === filters[activeFilter.value]
    );
  }

  // 根据搜索条件过滤
  filterCharacterList.value = filteredList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );

  // 若搜索结果不为空，则默认选中第一项
  if (filterCharacterList.value.length > 0) {
    selectCharacter(0);
  } else {
    activeCharacter.value = null; // 无匹配项时，取消选中
  }
});

</script>

<style lang="scss" scoped></style>
