<template>
  <div class="app" :class="{ 'night-mode': isNight }">
    <!-- 动态背景 -->
    <div class="weather-bg" :style="bgStyle"></div>
    
    <div class="content">
      <h1 class="title">
        <span class="title-icon">🌤️</span>
        天气应用
      </h1>
      
      <!-- 搜索组件 - 使用统一的包装类 -->
      <div class="section-wrapper">
        <SearchCity 
          ref="searchRef"
          @search-start="handleSearchStart"
          @search-complete="handleSearchComplete"
          @search-error="handleSearchError"
        />
      </div>
      
      <!-- 加载动画 - 使用统一的包装类 -->
      <div v-if="loading" class="section-wrapper">
        <div class="loading-container">
          <div class="weather-loader">
            <div class="cloud"></div>
            <div class="sun"></div>
            <p>加载天气数据...</p>
          </div>
        </div>
      </div>
      
      <!-- 历史记录组件 - 使用统一的包装类 -->
      <div class="section-wrapper">
        <SearchHistory 
          :history="searchHistory"
          @select="handleHistorySelect"
          @delete="removeHistoryItem"
          @clear="clearHistory"
        />
      </div>

      <!-- 天气卡片 - 使用统一的包装类 -->
      <transition name="fade" mode="out-in">
        <div v-if="weatherData" class="section-wrapper" key="weather">
          <WeatherCard
            :city="weatherData.city"
            :current="weatherData.current"
            :forecast="weatherData.forecast"
            :air-data="weatherData.air"
            :show-debug="showDebug"
            @toggle-debug="showDebug = !showDebug"
          />
        </div>
        
        <!-- 空状态 - 使用统一的包装类 -->
        <div v-else-if="!loading" class="section-wrapper" key="empty">
          <el-empty 
            description="搜索城市查看天气" 
            :image-size="200"
          >
            <template #image>
              <div class="empty-animation">
                <span class="empty-icon">🔍</span>
              </div>
            </template>
          </el-empty>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import SearchCity from './components/SearchCity.vue'
import SearchHistory from './components/SearchHistory.vue'
import WeatherCard from './components/WeatherCard.vue'
import { useSearchHistory } from './composables/useSearchHistory'
import { getWeatherIcon } from './utils/weatherIcons'
import weatherAPI from './api/weather'

// --- 状态变量 ---
const weatherData = ref(null)
const loading = ref(false)
const showDebug = ref(true)
const searchRef = ref(null)

// --- 搜索历史 ---
const { searchHistory, addSearchRecord, removeHistoryItem, clearHistory } = useSearchHistory()

// --- 事件处理 ---
const handleSearchStart = () => {
  loading.value = true
  weatherData.value = null
  console.log('开始搜索...')
}

const handleSearchComplete = (data) => {
  weatherData.value = data
  loading.value = false
  
  // 添加到历史记录
  addSearchRecord(data.city)
  
  ElMessage.success(`已获取 ${data.city.name} 的天气`)
  console.log('天气数据：', data)
}

const handleSearchError = (error) => {
  loading.value = false
  console.error('搜索出错：', error)
}

// --- 历史记录选择 ---
const handleHistorySelect = async (item) => {
  console.log('点击历史记录:', item)
  
  loading.value = true
  
  try {
    const cityInfo = {
      id: item.id,
      name: item.name,
      fullName: item.fullName,
      country: item.country,
      adm1: item.adm1,
      lat: item.lat,
      lon: item.lon
    }
    
    const weatherResult = await weatherAPI.getCompleteWeatherByCity(cityInfo)
    
    // 更新搜索框
    if (searchRef.value) {
      searchRef.value.setCityName?.(item.name)
    }
    
    handleSearchComplete(weatherResult)
    
  } catch (error) {
    console.error('历史记录搜索失败:', error)
    ElMessage.error(`获取 ${item.name} 天气失败，请重试`)
    loading.value = false
  }
}

// --- 计算属性 ---
const isNight = computed(() => {
  const hour = new Date().getHours()
  return hour < 6 || hour >= 18
})

const bgStyle = computed(() => {
  if (!weatherData.value?.current?.text) {
    if (isNight.value) {
      return { background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }
    }
    return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }
  
  const text = weatherData.value.current.text
  const { type } = getWeatherIcon(text)
  
  if (isNight.value) {
    if (type === 'rain') return { background: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)' }
    if (type === 'snow') return { background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }
    if (type === 'sunny') return { background: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' }
    return { background: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' }
  }

  if (type === 'rain') {
    return { background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)' }
  }
  if (type === 'snow') {
    return { background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)' }
  }
  if (type === 'sunny') {
    return { background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }
  }
  return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:global(body) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow-x: hidden;
  background: transparent; 
}

.app {
  min-height: 100vh;
  position: relative;
  transition: background 0.5s ease;
  color: #333;
}

.weather-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  transition: background 0.8s ease;
}

.content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 统一的包装类 - 所有内容都用这个 */
.section-wrapper {
  width: 100%;
  padding: 0 10px;        /* 统一左右内边距 */
  margin-bottom: 20px;    /* 统一底部间距 */
  box-sizing: border-box;
}

/* 标题不需要内边距，保持居中 */
.title {
  text-align: center;
  color: white;
  font-size: 2.8rem;
  margin-bottom: 30px;
  text-shadow: 2px 4px 12px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  animation: titleFloat 3s ease-in-out infinite;
}

@keyframes titleFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.title-icon {
  font-size: 3.2rem;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.weather-loader {
  text-align: center;
  padding: 40px;
  color: white;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.cloud {
  width: 80px;
  height: 30px;
  background: rgba(255,255,255,0.9);
  border-radius: 30px;
  position: relative;
  margin: 0 auto 20px;
  animation: cloudMove 2s ease-in-out infinite;
}

.cloud:before,
.cloud:after {
  content: '';
  position: absolute;
  background: rgba(255,255,255,0.9);
  border-radius: 50%;
}

.cloud:before {
  width: 40px;
  height: 40px;
  top: -20px;
  left: 10px;
}

.cloud:after {
  width: 30px;
  height: 30px;
  top: -15px;
  right: 10px;
}

.sun {
  width: 30px;
  height: 30px;
  background: #ffd700;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: sunRotate 4s linear infinite;
  box-shadow: 0 0 20px #ffd700;
}

@keyframes cloudMove {
  0%, 100% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
}

@keyframes sunRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

/* 空状态动画 */
.empty-animation {
  animation: emptyFloat 2s ease-in-out infinite;
  display: inline-block;
}

@keyframes emptyFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.empty-icon {
  font-size: 5rem;
  display: block;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

/* 确保 Element Plus 组件的样式 */
:deep(.el-input__wrapper) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* 历史记录组件的样式调整 */
:deep(.history-container) {
  width: 100%;
}

/* 调试卡片样式 */
:global(.debug-card) {
  margin-top: 20px;
  background: rgba(30, 30, 30, 0.9) !important;
  color: #fff;
}

:global(.debug-card pre) {
  color: #a5d6ff;
  font-size: 0.8rem;
  max-height: 300px;
  overflow: auto;
}
</style>