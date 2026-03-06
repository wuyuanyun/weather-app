<template>
  <el-card class="weather-card" :class="weatherCardClass" shadow="hover">
    <!-- 头部 -->
    <template #header>
      <div class="card-header">
        <div class="location-info">
          <h2 class="city-name">{{ city.name }}</h2>
          <p class="city-full">
            <el-icon><Location /></el-icon>
            {{ city.fullName }}
          </p>
        </div>
        <div class="header-actions">
          <el-tag 
            v-if="airData?.aqi" 
            :type="getAQITagType(airData.aqi)"
            size="large"
            effect="dark"
          >
            AQI: {{ airData.aqi }}
          </el-tag>
        </div>
      </div>
    </template>
    
    <!-- 当前天气 -->
    <CurrentWeather :current="current" />
    
    <!-- 空气质量 -->
    <AirQuality 
      :air-data="airData"
      :update-time="current?.updateTime"
      :show-empty="true"
    />
    
    <!-- 天气预报 -->
    <WeatherForecast 
      v-if="forecast"
      :forecast="forecast"
      :show-detail="true"
    />
    
    <!-- 更新时间 -->
    <div class="update-time">
      <el-icon><Timer /></el-icon>
      更新时间：{{ formatTime(current?.updateTime) }}
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { Location, Timer } from '@element-plus/icons-vue'
import { getWeatherIcon } from '../utils/weatherIcons'
import CurrentWeather from './CurrentWeather.vue'
import AirQuality from './AirQuality.vue'
import WeatherForecast from './WeatherForecast.vue'

const props = defineProps({
  city: {
    type: Object,
    required: true
  },
  current: {
    type: Object,
    required: true
  },
  forecast: {
    type: Object,
    default: null
  },
  airData: {
    type: Object,
    default: null
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-debug'])

// 工具函数
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 根据AQI获取标签类型
const getAQITagType = (aqi) => {
  const num = parseInt(aqi)
  if (isNaN(num)) return 'info'
  if (num <= 50) return 'success'
  if (num <= 100) return 'info'
  if (num <= 150) return 'warning'
  return 'danger'
}

// 天气卡片样式类名
const weatherCardClass = computed(() => {
  if (!props.current?.text) return ''
  
  const { type } = getWeatherIcon(props.current.text)
  
  if (type === 'rain') return 'rain-card'
  if (type === 'snow') return 'snow-card'
  if (type === 'sunny') return 'sunny-card'
  if (type === 'cloudy') return 'cloudy-card'
  return ''
})
</script>

<style scoped>
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

/* 夜间模式样式 */
:global(.night-mode) .weather-card {
  background: rgba(30, 30, 40, 0.85) !important;
  border-color: rgba(255,255,255,0.1);
}

:global(.night-mode) .city-name {
  color: #f0f0f0;
}

:global(.night-mode) .city-full {
  color: #b0b0b0;
}

:global(.night-mode) .update-time {
  border-top-color: rgba(255,255,255,0.1);
  color: #888;
}

@media (max-width: 600px) {
  .city-name {
    font-size: 1.6rem;
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