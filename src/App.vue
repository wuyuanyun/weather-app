<template>
  <div class="app" :class="{ 'night-mode': isNight }">
    <!-- 动态背景 -->
    <div class="weather-bg" :style="bgStyle"></div>
    
    <div class="content">
      <h1 class="title">
        <span class="title-icon">🌤️</span>
        天气应用
      </h1>
      
      <!-- 搜索组件 -->
      <SearchCity 
        @search-start="handleSearchStart"
        @search-complete="handleSearchComplete"
        @search-error="handleSearchError"
      />
      
      <!-- 加载动画 -->
      <div v-if="loading" class="loading-container">
        <div class="weather-loader">
          <div class="cloud"></div>
          <div class="sun"></div>
          <p>加载天气数据...</p>
        </div>
      </div>
      
      <!-- 历史记录组件（新加） -->
      <SearchHistory 
        :history="searchHistory"
        @select="handleHistorySelect"
        @delete="removeHistoryItem"
        @clear="clearHistory"
      />

      <!-- 天气卡片 -->
      <transition name="fade" mode="out-in">
        <div v-if="weatherData" class="weather-container" key="weather">
          <el-card class="weather-card" :class="weatherCardClass" shadow="hover">
            <!-- 头部 -->
            <template #header>
              <div class="card-header">
                <div class="location-info">
                  <h2 class="city-name">{{ weatherData.city.name }}</h2>
                  <p class="city-full">
                    <el-icon><Location /></el-icon>
                    {{ weatherData.city.fullName }}
                  </p>
                </div>
                <div class="header-actions">
                  <el-tag 
                    v-if="weatherData.air?.aqi" 
                    :type="getAQITagType(weatherData.air.aqi)"
                    size="large"
                    effect="dark"
                  >
                    AQI: {{ weatherData.air.aqi }}
                  </el-tag>
                  <el-button 
                    v-if="showDebug" 
                    type="info" 
                    circle 
                    size="small"
                    @click="showDebug = !showDebug"
                  >
                    🐛
                  </el-button>
                </div>
              </div>
            </template>
            
            <!-- 主要天气信息 -->
            <div class="main-weather">
              <div class="weather-icon-large">
                {{ weatherIcon }}
              </div>
              <div class="temperature-section">
                <div class="temperature">
                  <span class="temp-value">{{ weatherData.current.temp }}</span>
                  <span class="temp-unit">°C</span>
                </div>
                <div class="weather-desc">
                  {{ weatherData.current.text }}
                  <span class="feels-like">体感 {{ weatherData.current.feelsLike }}°</span>
                </div>
              </div>
            </div>
            
            <!-- 天气详情网格 -->
            <div class="details-grid">
              <div class="detail-card" v-for="item in weatherDetails" :key="item.label">
                <div class="detail-icon">{{ item.icon }}</div>
                <div class="detail-content">
                  <div class="detail-label">{{ item.label }}</div>
                  <div class="detail-value">{{ item.value }}</div>
                </div>
              </div>
            </div>

            <!-- 新增：空气质量组件 -->
            <AirQuality 
              :air-data="weatherData.air"
              :update-time="weatherData.current?.updateTime"
              :show-empty="true"
            />
            
            <WeatherForecast 
                v-if="weatherData.forecast"
                :forecast="weatherData.forecast"
                :show-detail="true"
              />
              <!-- 更新时间 -->
            <div class="update-time">
              <el-icon><Timer /></el-icon>
              更新时间：{{ formatTime(weatherData.current.updateTime) }}
            </div>
          </el-card>
          
          <!-- 调试信息 -->
          <transition name="fade">
            <el-card v-if="showDebug" class="debug-card">
              <template #header>
                <div class="card-header">
                  <span>🔧 调试信息</span>
                  <el-button type="info" circle size="small" @click="showDebug = false">
                    ✕
                  </el-button>
                </div>
              </template>
              <pre>{{ JSON.stringify(weatherData, null, 2) }}</pre>
            </el-card>
          </transition>
        </div>
        
        <!-- 空状态 -->
        <el-empty 
          v-else-if="!loading" 
          description="搜索城市查看天气" 
          :image-size="200"
          key="empty"
        >
          <template #image>
            <div class="empty-animation">
              <span class="empty-icon">🔍</span>
            </div>
          </template>
        </el-empty>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Location, Timer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SearchCity from './components/SearchCity.vue'
import SearchHistory from './components/SearchHistory.vue'
import WeatherForecast from './components/WeatherForecast.vue'
import { useSearchHistory } from './composables/useSearchHistory'
import { getWeatherIcon } from './utils/weatherIcons'
import weatherAPI from './api/weather'
import AirQuality from './components/AirQuality.vue'  

// --- 状态变量 ---
const weatherData = ref(null)
const loading = ref(false)
const showDebug = ref(true)

// --- 事件处理 ---
const handleSearchStart = () => {
  loading.value = true
  weatherData.value = null
  console.log('开始搜索...')
}

const handleSearchError = (error) => {
  loading.value = false
  console.error('搜索出错：', error)
  // 错误提示通常在子组件中已处理
}

// --- 工具方法 ---
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// --- 计算属性 ---

// 计算天气图标 (调用外部工具函数)
const weatherIcon = computed(() => {
  if (!weatherData.value?.current?.text) return '🌈'
  // ✅ 这里直接使用您外部文件的逻辑
  const { icon } = getWeatherIcon(weatherData.value.current.text)
  return icon
})

// 判断是否是夜晚
const isNight = computed(() => {
  const hour = new Date().getHours()
  return hour < 6 || hour >= 18
})

// 天气卡片样式类名 (根据天气类型匹配 CSS 类)
const weatherCardClass = computed(() => {
  if (!weatherData.value?.current?.text) return ''
  
  const text = weatherData.value.current.text
  // 这里也可以考虑调用 getWeatherIcon 获取 type 来匹配，保持逻辑一致
  // 假设您的 getWeatherIcon 返回 { icon: '...', type: 'sunny' }
  const { type } = getWeatherIcon(text)
  
  // 根据 type 返回对应的 class
  if (type === 'rain') return 'rain-card'
  if (type === 'snow') return 'snow-card'
  if (type === 'sunny') return 'sunny-card'
  if (type === 'cloudy') return 'cloudy-card'
  return ''
})

// 动态背景样式
const bgStyle = computed(() => {
  if (!weatherData.value?.current?.text) {
    if (isNight.value) {
       return { background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' }
    }
    return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }
  }
  
  const text = weatherData.value.current.text
  const { type } = getWeatherIcon(text)
  
  // 如果是夜晚，整体色调偏暗
  if (isNight.value) {
     if (type === 'rain') return { background: 'linear-gradient(135deg, #0f2027 0%, #203a43 100%)' }
     if (type === 'snow') return { background: 'linear-gradient(135deg, #232526 0%, #414345 100%)' }
     if (type === 'sunny') return { background: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' }
     return { background: 'linear-gradient(135deg, #141E30 0%, #243B55 100%)' }
  }

  // 白天色调
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

// 天气详情数据
const weatherDetails = computed(() => {
  if (!weatherData.value?.current) return []
  
  const current = weatherData.value.current
  return [
    { icon: '💧', label: '湿度', value: `${current.humidity ?? 0}%` },
    { icon: '☔', label: '降水', value: `${current.precip ?? 0}mm` },
    { icon: '💨', label: '风向', value: current.windDir ?? '-' },
    { icon: '🌪️', label: '风力', value: `${current.windScale ?? 0}级` },
    { icon: '📊', label: '气压', value: `${current.pressure ?? 0}hPa` },
    { icon: '👁️', label: '能见度', value: `${current.vis ?? 0}km` }
  ]
})

// // 根据AQI获取标签类型
// const getAQITagType = (aqi) => {
//   const num = parseInt(aqi)
//   if (isNaN(num)) return 'info'
//   if (num <= 50) return 'success'
//   if (num <= 100) return 'info'
//   if (num <= 150) return 'warning'
//   return 'danger'
// }

// --- 搜索历史相关 ---
// 使用历史记录
const { searchHistory, addSearchRecord, removeHistoryItem, clearHistory } = useSearchHistory()

// 处理搜索完成
const handleSearchComplete = (data) => {
  weatherData.value = data
  loading.value = false
  
  // 添加到历史记录
  addSearchRecord(data.city)
  
  ElMessage.success(`已获取 ${data.city.name} 的天气`)
  console.log('天气数据：', data)
}
const searchRef = ref(null)
// 处理历史记录选择
// 处理历史记录点击 - 使用保存的完整城市信息
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
    
    // 使用城市ID获取天气
    const weatherData = await weatherAPI.getCompleteWeatherByCity(cityInfo)
    
    // 检查 searchRef 是否存在再调用
    if (searchRef.value) {
      searchRef.value.setCityName?.(item.name)  // 使用可选链，防止方法不存在
    }
    
    handleSearchComplete(weatherData)
    
  } catch (error) {
    console.error('历史记录搜索失败:', error)
    ElMessage.error(`获取 ${item.name} 天气失败，请重试`)
    loading.value = false
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
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

/* 动态背景层 */
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

/* 标题样式 */
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

/* 天气卡片基础样式 */
.weather-card {
  border-radius: 24px !important;
  overflow: hidden;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.95) !important;
  transition: all 0.3s ease;
  animation: cardAppear 0.5s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes cardAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 不同天气的卡片微调 */
.rain-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(200,230,255,0.9)) !important;
}

.snow-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(230,245,255,0.95)) !important;
}

.sunny-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,245,220,0.95)) !important;
}

.cloudy-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.95), rgba(230,235,240,0.95)) !important;
}

/* 卡片头部布局 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.location-info {
  flex: 1;
  min-width: 200px;
}

.city-name {
  font-size: 2rem;
  color: #333;
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

.city-full {
  font-size: 0.95rem;
  color: #666;
  margin: 5px 0 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 主要天气区域布局 */
.main-weather {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 30px 0;
  flex-wrap: wrap;
  gap: 20px;
}

.weather-icon-large {
  font-size: 6rem;
  line-height: 1;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.temperature-section {
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.temperature {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 5px;
}

.temp-value {
  font-size: 5.5rem;
  font-weight: 800;
  color: #333;
  line-height: 1;
  letter-spacing: -2px;
  text-shadow: 2px 4px 12px rgba(0,0,0,0.1);
}

.temp-unit {
  font-size: 2rem;
  color: #666;
  font-weight: 500;
}

.weather-desc {
  font-size: 1.8rem;
  color: #444;
  margin-top: 10px;
  font-weight: 500;
}

.feels-like {
  font-size: 1rem;
  color: #888;
  margin-left: 10px;
  font-weight: normal;
}

/* 详情网格布局 */
.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 20px 0;
}

.detail-card {
  background: rgba(245, 245, 245, 0.6);
  padding: 15px;
  border-radius: 16px;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255,255,255,0.4);
}

.detail-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  background: rgba(255, 255, 255, 0.8);
}

.detail-icon {
  font-size: 2rem;
  min-width: 40px;
  text-align: center;
}

.detail-content {
  flex: 1;
  text-align: left;
  overflow: hidden;
}

.detail-label {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 4px;
  white-space: nowrap;
}

.detail-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
}

/* 更新时间 */
.update-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  color: #999;
  font-size: 0.9rem;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

/* 调试卡片 */
.debug-card {
  margin-top: 20px;
  background: rgba(30, 30, 30, 0.9) !important;
  color: #fff;
}
.debug-card pre {
  color: #a5d6ff;
  font-size: 0.8rem;
  max-height: 300px;
  overflow: auto;
}
.debug-card .detail-label, 
.debug-card .detail-value,
.debug-card .city-name {
  color: #fff;
}

/* 动画过渡类 */
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

/* 夜间模式覆盖样式 */
.night-mode .weather-card {
  background: rgba(30, 30, 40, 0.85) !important;
  border-color: rgba(255,255,255,0.1);
}

.night-mode .city-name,
.night-mode .temp-value,
.night-mode .detail-value {
  color: #f0f0f0;
}

.night-mode .city-full,
.night-mode .weather-desc,
.night-mode .detail-label,
.night-mode .temp-unit,
.night-mode .feels-like {
  color: #b0b0b0;
}

.night-mode .detail-card {
  background: rgba(50, 50, 60, 0.6);
  border-color: rgba(255,255,255,0.05);
}

.night-mode .detail-card:hover {
  background: rgba(60, 60, 70, 0.8);
}

.night-mode .update-time {
  border-top-color: rgba(255,255,255,0.1);
  color: #888;
}

.night-mode .weather-desc {
  color: #ddd;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .title {
    font-size: 2.2rem;
    margin-bottom: 20px;
  }
  
  .title-icon {
    font-size: 2.5rem;
  }
  
  .city-name {
    font-size: 1.6rem;
  }
  
  .main-weather {
    flex-direction: column;
    padding: 10px 0;
  }
  
  .weather-icon-large {
    font-size: 5rem;
    margin-bottom: 10px;
  }
  
  .temp-value {
    font-size: 4.5rem;
  }
  
  .weather-desc {
    font-size: 1.4rem;
  }
  
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  .detail-card {
    padding: 12px;
  }
  
  .detail-icon {
    font-size: 1.6rem;
    min-width: 30px;
  }
  
  .detail-value {
    font-size: 1.1rem;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>