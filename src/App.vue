<script setup>
import { useRouter, useRoute } from 'vue-router'
import { Setting, House, Document } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const handleSelect = (key) => {
  router.push(key)
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside-container">
      <div class="logo">
        <span class="logo-text">Drone System</span>
      </div>
      <el-scrollbar>
        <el-menu
          :default-active="route.path"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
          style="border-right: none;"
          @select="handleSelect"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/pitfall">
            <el-icon><Document /></el-icon>
            <span>避坑指南管理</span>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    
    <el-container>
      <el-header class="header-container">
        <div class="header-left">
           <span>管理控制台</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="el-dropdown-link">
              Admin
              <el-icon class="el-icon--right"><setting /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside-container {
  background-color: #304156;
  transition: width 0.28s;
}

.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  background-color: #2b2f3a;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.header-container {
  background-color: #fff;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dcdfe6;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.header-right {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.main-container {
  background-color: #f0f2f5;
  padding: 20px;
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.5s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
