<template>
    <div>
      <div class="top-nav">
        <!-- 顶部导航菜单 -->
        <ul class="nav-menu">
          <li class="title">AI语音合成</li>
          <li
            v-for="(item, index) in menuItems"
            :key="item.text"
            :class="{ active: activeIndex === index }"
            @click="setActive(index)"
          >
            <router-link :to="item.link">{{ item.text }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import "./index.scss";
  import { ref } from "vue";
  import { useRouter } from "vue-router"; // 引入 useRouter
  
  // 导航菜单项
  const menuItems = [
    // { text: "声音模板", link: "/sampleLibary" },
    { text: "语音合成", link: "/tts" },
    { text: "课件制作", link: "/ppt" },
    { text: "声音置换", link: "/audioConvert" },
    { text: "声音学堂", link: "/audioLesson"}
  ];
  
  // 当前选中的菜单项索引
  const activeIndex = ref(0);
  
  // 设置当前选中的菜单项
  const setActive = (index) => {
    activeIndex.value = index;
  };
  
  // 监听路由变化，动态设置 activeIndex
  const router = useRouter();
  router.afterEach((to) => {
    const index = menuItems.findIndex((item) => item.link === to.path);
    if (index !== -1) {
      activeIndex.value = index;
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .top-nav {
    width: 100%;
    background-color: #007bff;
    padding: 10px 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
    .nav-menu {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
  
      .title {
        font-size: 1.2em;
        font-weight: bold;
        margin-right: 30px;
      }
  
      li {
        margin-right: 15px;
        cursor: pointer;
  
        a {
          text-decoration: none;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
  
          &:hover {
            background-color: #e9ecef;
            color: black;
          }
        }
  
        &.active a {
          background-color: white;
          color: black;
        }
      }
    }
  }
  </style>