<template>
  <div class="index">
    <div class="sidebar-container">
      <Sidebar></Sidebar>
    </div>
    <div class="content-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import './index.scss'
import { onMounted } from "vue";
import Sidebar from "../Sidebar/index.vue";

onMounted(() => {});
</script>

<style lang="scss" scoped>

</style>
