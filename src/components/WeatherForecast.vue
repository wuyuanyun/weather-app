<template>
  <div class="forecast-section">
    <div class="forecast-header">
      <h3>📅 未来3天预报</h3>
    </div>
    
    <!-- 3天预报卡片 -->
    <div class="forecast-list">
      <div 
        v-for="(day, index) in forecastDays" 
        :key="day.fxDate"
        class="forecast-card"
        :class="{ 'today': index === 0 }"
      >
        <!-- 日期 -->
        <div class="forecast-date">
          {{ formatDate(day.fxDate, index) }}
        </div>
        
        <!-- 天气图标 -->
        <div class="forecast-icon">
          {{ getWeatherIcon(day.textDay).icon }}
        </div>

        <!-- 天气描述 -->
        <div class="forecast-text">
          {{ day.textDay }}
        </div>
        
        <!-- 温度范围 -->
        <div class="forecast-temp">
          <span class="temp-max">{{ day.tempMax }}°</span>
          <span class="temp-min">{{ day.tempMin }}°</span>
        </div>
        
        <!-- 风力（可选） -->
        <div class="forecast-wind" v-if="showDetail">
          {{ day.windDirDay }} {{ day.windScaleDay }}级
        </div>
      </div>
    </div>
    
    <!-- 移动版视图（横屏变竖屏） -->
    <div class="forecast-list-mobile">
      <div 
        v-for="(day, index) in forecastDays" 
        :key="day.fxDate"
        class="forecast-item-mobile"
      >
        <div class="mobile-left">
          <div class="mobile-date">{{ formatDate(day.fxDate, index) }}</div>
          <div class="mobile-weather">{{ day.textDay }}</div>
        </div>
        <div class="mobile-center">
          <span class="mobile-icon">{{ getWeatherIcon(day.textDay) }}</span>
        </div>
        <div class="mobile-right">
          <span class="mobile-temp-max">{{ day.tempMax }}°</span>
          <span class="mobile-temp-min">{{ day.tempMin }}°</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getWeatherIcon } from '@/utils/weatherIcons'

const props = defineProps({
  forecast: {
    type: Object,
    default: () => ({})
  },
  showDetail: {
    type: Boolean,
    default: false
  }
})

// 预报天数数组
const forecastDays = computed(() => props.forecast?.daily || [])

// 更新时间
const updateTime = computed(() => props.forecast?.updateTime || '')

// 格式化日期
const formatDate = (dateStr, index) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // 今天
  if (date.toDateString() === today.toDateString()) {
    return '今天'
  }
  // 明天
  if (date.toDateString() === tomorrow.toDateString()) {
    return '明天'
  }
  
  // 返回 MM-DD
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}/${day}`
}

// 格式化更新时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.forecast-section {
  margin: 30px 0 20px;
}

.forecast-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.forecast-header h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
}

.update-time {
  font-size: 0.8rem;
  color: #999;
}

/* 桌面版：横排显示 */
.forecast-list {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.forecast-card {
  flex: 1;
  text-align: center;
  padding: 20px 10px;
  background: #f8f9fa;
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.forecast-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  background: white;
}

.forecast-card.today {
  background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
  border: 1px solid #667eea30;
}

.forecast-date {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.forecast-icon {
  font-size: 2.5rem;
  margin: 10px 0;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
}

.forecast-text {
  font-size: 1rem;
  color: #666;
  margin-bottom: 10px;
}

.forecast-temp {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 1.1rem;
}

.temp-max {
  font-weight: 600;
  color: #e74c3c;
}

.temp-min {
  color: #3498db;
}

.forecast-wind {
  font-size: 0.8rem;
  color: #999;
  margin-top: 8px;
}

/* 移动版：默认隐藏 */
.forecast-list-mobile {
  display: none;
}

/* 响应式 */
@media (max-width: 600px) {
  .forecast-list {
    display: none;
  }
  
  .forecast-list-mobile {
    display: block;
  }
  
  .forecast-item-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 15px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
  }
  
  .forecast-item-mobile:active {
    transform: scale(0.98);
    background: #f0f0f0;
  }
  
  .mobile-left {
    flex: 2;
  }
  
  .mobile-date {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
  }
  
  .mobile-weather {
    font-size: 0.9rem;
    color: #666;
  }
  
  .mobile-center {
    flex: 1;
    text-align: center;
  }
  
  .mobile-icon {
    font-size: 2rem;
  }
  
  .mobile-right {
    flex: 1;
    text-align: right;
  }
  
  .mobile-temp-max {
    font-weight: 600;
    color: #e74c3c;
    margin-right: 5px;
    font-size: 1.1rem;
  }
  
  .mobile-temp-min {
    color: #3498db;
    font-size: 1rem;
  }
}
</style>