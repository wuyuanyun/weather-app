<template>
  <div class="current-weather">
    <!-- 主要天气信息 -->
    <div class="main-weather">
      <div class="weather-icon-large">
        {{ weatherIcon }}
      </div>
      <div class="temperature-section">
        <div class="temperature">
          <span class="temp-value">{{ current.temp }}</span>
          <span class="temp-unit">°C</span>
        </div>
        <div class="weather-desc">
          {{ current.text }}
          <span class="feels-like">体感 {{ current.feelsLike }}°</span>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getWeatherIcon } from '../utils/weatherIcons'

const props = defineProps({
  current: {
    type: Object,
    required: true
  }
})

// 计算天气图标
const weatherIcon = computed(() => {
  if (!props.current?.text) return '🌈'
  const { icon } = getWeatherIcon(props.current.text)
  return icon
})

// 天气详情数据
const weatherDetails = computed(() => {
  if (!props.current) return []
  
  const current = props.current
  return [
    { icon: '💧', label: '湿度', value: `${current.humidity ?? 0}%` },
    { icon: '☔', label: '降水', value: `${current.precip ?? 0}mm` },
    { icon: '💨', label: '风向', value: current.windDir ?? '-' },
    { icon: '🌪️', label: '风力', value: `${current.windScale ?? 0}级` },
    { icon: '📊', label: '气压', value: `${current.pressure ?? 0}hPa` },
    { icon: '👁️', label: '能见度', value: `${current.vis ?? 0}km` }
  ]
})
</script>

<style scoped>
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

/* 夜间模式样式 */
:global(.night-mode) .temp-value,
:global(.night-mode) .detail-value {
  color: #f0f0f0;
}

:global(.night-mode) .weather-desc,
:global(.night-mode) .detail-label,
:global(.night-mode) .temp-unit,
:global(.night-mode) .feels-like {
  color: #b0b0b0;
}

:global(.night-mode) .detail-card {
  background: rgba(50, 50, 60, 0.6);
  border-color: rgba(255,255,255,0.05);
}

:global(.night-mode) .detail-card:hover {
  background: rgba(60, 60, 70, 0.8);
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
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
}
</style>