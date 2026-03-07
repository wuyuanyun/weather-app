<template>
  <div class="air-quality" v-if="airData">
    <el-divider>🌫️ 空气质量</el-divider>
    
    <!-- 主要AQI显示 -->
    <div class="aqi-main">
      <div class="aqi-circle" :style="aqiCircleStyle">
        <div class="aqi-value">{{ aqiValue }}</div>
        <div class="aqi-category">{{ aqiCategory }}</div>
      </div>
      <div class="aqi-desc">
        <div class="aqi-title">空气质量指数 ({{ aqiIndexName }})</div>
        <div class="aqi-level" :style="{ color: aqiColor }">{{ aqiLevel }}</div>
        <div class="aqi-effect">{{ aqiEffect }}</div>
        <div class="aqi-advice">
          <p>👥 一般人群：{{ generalAdvice }}</p>
          <p>⚠️ 敏感人群：{{ sensitiveAdvice }}</p>
        </div>
      </div>
    </div>
    
    <!-- 主要污染物标识 -->
    <div v-if="primaryPollutant" class="primary-pollutant">
      主要污染物：{{ primaryPollutant }}
    </div>
    
    <!-- 污染物列表 -->
    <div class="pollutants-grid">
      <div v-for="item in pollutantsList" :key="item.code" class="pollutant-item">
        <div class="pollutant-name">{{ item.name }}</div>
        <div class="pollutant-value">
          <span class="value">{{ item.value }}</span>
          <span class="unit">{{ item.unit }}</span>
        </div>
        <div v-if="item.aqi" class="pollutant-aqi">
          AQI: {{ item.aqi }}
        </div>
      </div>
    </div>
    
    <!-- 监测站信息 -->
    <div v-if="stations.length > 0" class="stations">
      <div class="stations-title">监测站</div>
      <div class="stations-list">
        <el-tag 
          v-for="station in stations" 
          :key="station.id"
          size="small"
          class="station-tag"
        >
          {{ station.name }}
        </el-tag>
      </div>
    </div>
  </div>
  
  <!-- 无数据时的提示 -->
  <div v-else-if="showEmpty" class="air-empty">
    <el-divider>🌫️ 空气质量</el-divider>
    <el-empty description="暂无空气质量数据" :image-size="100" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  airData: {
    type: Object,
    default: null
  },
  showEmpty: {
    type: Boolean,
    default: true
  },
  updateTime: {
    type: String,
    default: ''
  }
})

// 获取主要空气质量指数（使用 cn-mee 标准）
const mainIndex = computed(() => {
  if (!props.airData?.indexes) return null
  return props.airData.indexes.find(item => item.code === 'cn-mee') || props.airData.indexes[0]
})

// AQI数值
const aqiValue = computed(() => mainIndex.value?.aqi || mainIndex.value?.aqiDisplay || '--')

// 指数名称
const aqiIndexName = computed(() => mainIndex.value?.name || 'AQI')

// AQI类别（优、良等）
const aqiCategory = computed(() => mainIndex.value?.category || '')

// AQI等级
const aqiLevel = computed(() => {
  const value = parseInt(aqiValue.value)
  if (value <= 50) return '优'
  if (value <= 100) return '良'
  if (value <= 150) return '轻度污染'
  if (value <= 200) return '中度污染'
  if (value <= 300) return '重度污染'
  return '严重污染'
})

// AQI等级对应的颜色
const aqiColor = computed(() => {
  const value = parseInt(aqiValue.value)
  if (value <= 50) return '#00e400'      // 优 - 绿色
  if (value <= 100) return '#ffff00'     // 良 - 黄色
  if (value <= 150) return '#ff7e00'     // 轻度污染 - 橙色
  if (value <= 200) return '#ff0000'     // 中度污染 - 红色
  if (value <= 300) return '#8f3f97'     // 重度污染 - 紫色
  return '#7e0023'                        // 严重污染 - 褐红色
})

// 圆形进度条样式
const aqiCircleStyle = computed(() => ({
  borderColor: aqiColor.value,
  boxShadow: `0 0 20px ${aqiColor.value}40`
}))

// 健康影响描述
const aqiEffect = computed(() => {
  return mainIndex.value?.health?.effect || ''
})

// 一般人群建议
const generalAdvice = computed(() => {
  return mainIndex.value?.health?.advice?.generalPopulation || '适合户外活动'
})

// 敏感人群建议
const sensitiveAdvice = computed(() => {
  return mainIndex.value?.health?.advice?.sensitivePopulation || '正常活动'
})

// 主要污染物
const primaryPollutant = computed(() => {
  return mainIndex.value?.primaryPollutant?.name || null
})

// 污染物列表
const pollutantsList = computed(() => {
  if (!props.airData?.pollutants) return []
  
  return props.airData.pollutants.map(p => {
    // 污染物名称映射
    const nameMap = {
      'pm2p5': 'PM2.5',
      'pm10': 'PM10',
      'no2': '二氧化氮',
      'o3': '臭氧',
      'so2': '二氧化硫',
      'co': '一氧化碳'
    }
    
    // 获取AQI子指数
    const aqi = p.subIndexes?.find(s => s.code === 'cn-mee')?.aqi || 
                p.subIndexes?.[0]?.aqi
    
    return {
      code: p.code,
      name: nameMap[p.code] || p.name,
      value: p.concentration?.value?.toFixed(1) || '0',
      unit: p.concentration?.unit || 'μg/m³',
      aqi: aqi
    }
  })
})

// 监测站列表
const stations = computed(() => {
  return props.airData?.stations || []
})

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<style scoped>
.air-quality {
  margin: 20px 0;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.aqi-main {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 20px;
  margin-bottom: 20px;
}

.aqi-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: white;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.aqi-value {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
  color: #333;
}

.aqi-category {
  font-size: 0.9rem;
  color: #666;
  margin-top: 5px;
}

.aqi-desc {
  flex: 1;
}

.aqi-title {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 5px;
}

.aqi-level {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.aqi-effect {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 10px;
  line-height: 1.5;
}

.aqi-advice {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 8px;
}

.aqi-advice p {
  margin: 5px 0;
}

.primary-pollutant {
  margin: 10px 0;
  padding: 8px 15px;
  background: #fff3cd;
  color: #856404;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.9rem;
}

.pollutants-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 20px;
}

.pollutant-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.2s ease;
}

.pollutant-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.pollutant-name {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 8px;
}

.pollutant-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.pollutant-value .unit {
  font-size: 0.8rem;
  color: #999;
  margin-left: 3px;
  font-weight: normal;
}

.pollutant-aqi {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.stations {
  margin-top: 20px;
}

.stations-title {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 10px;
}

.stations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.station-tag {
  background: #e9ecef !important;
  border: none !important;
  color: #495057 !important;
}

.update-time {
  text-align: right;
  color: #999;
  font-size: 0.8rem;
  margin-top: 15px;
}

.air-empty {
  margin: 20px 0;
}

/* 响应式 */
@media (max-width: 600px) {
  .aqi-main {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .pollutants-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .aqi-advice {
    text-align: left;
  }
}
</style>