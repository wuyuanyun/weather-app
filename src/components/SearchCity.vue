<template>
  <div class="search-container">
    <!-- 搜索输入框 -->
    <el-input
      v-model="cityName"
      placeholder="输入城市名，如：北京、旧金山"
      class="search-input"
      @keyup.enter="handleSearch"
      :disabled="loading"
      clearable
    >
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
    </el-input>
    
    <el-button 
      type="primary" 
      @click="handleSearch" 
      :loading="loading"
      class="search-button"
    >
      {{ loading ? '搜索中' : '搜索' }}
    </el-button>
    
    <!-- 多城市选择对话框 -->
    <el-dialog
      v-model="showCityDialog"
      title="找到多个匹配城市"
      width="90%"
      :max-width="500"
    >
      <p class="dialog-tip">请选择您要查询的城市：</p>
      <div class="city-list">
        <div
          v-for="city in multipleCities"
          :key="city.id"
          class="city-option"
          @click="selectCity(city)"
        >
          <div class="city-option-main">
            <span class="city-option-name">{{ city.name }}</span>
            <span class="city-option-full">{{ city.fullName }}</span>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, ArrowRight } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import weatherAPI from '@/api/weather'

const emit = defineEmits(['search-start', 'search-complete', 'search-error'])

const cityName = ref('')
const loading = ref(false)
const showCityDialog = ref(false)
const multipleCities = ref([])

// 处理搜索
const handleSearch = async () => {
  const trimmedCity = cityName.value.trim()
  if (!trimmedCity) {
    ElMessage.warning('请输入城市名')
    return
  }

  loading.value = true
  emit('search-start')
  
  try {
    console.log('开始搜索城市：', trimmedCity)
    
    const result = await weatherAPI.getCompleteWeather(trimmedCity)
    
    // 处理多城市情况
    if (result.multiple) {
      multipleCities.value = result.cities
      showCityDialog.value = true
      loading.value = false
      return
    }
    
    // 单个城市直接返回
    emit('search-complete', result)
    
  } catch (error) {
    console.error('搜索失败：', error)
    
    if (error.message.includes('未找到')) {
      ElMessage.error(`未找到城市"${trimmedCity}"`)
    } else {
      ElMessage.error(error.message || '获取天气失败')
    }
    
    emit('search-error', error)
    
  } finally {
    loading.value = false
  }
}

// 选择城市
const selectCity = async (city) => {
  showCityDialog.value = false
  loading.value = true
  
  try {
    const weatherData = await weatherAPI.getCompleteWeatherByCity(city)
    emit('search-complete', weatherData)
    
    // 可选：更新搜索框显示
    cityName.value = city.name
    
  } catch (error) {
    ElMessage.error('获取天气失败')
    emit('search-error', error)
  } finally {
    loading.value = false
  }
}

// 暴露方法
defineExpose({
  setCityName: (name) => {
    cityName.value = name
  }
})
</script>

<style scoped>
.search-container {
  display: flex;
  gap: 12px;
  max-width: 600px;
  margin: 20px auto;
  padding: 0 10px;
}

.search-input {
  flex: 1;
}

.search-button {
  min-width: 100px;
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  border: none !important;
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4) !important;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  border-radius: 12px !important;
}

.dialog-tip {
  margin-bottom: 15px;
  color: #666;
}

.city-list {
  max-height: 400px;
  overflow-y: auto;
}

.city-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.city-option:hover {
  background: #f5f7fa;
  transform: translateX(5px);
}

.city-option-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.city-option-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.city-option-full {
  font-size: 0.9rem;
  color: #999;
}

@media (max-width: 480px) {
  .search-button {
    min-width: 70px;
  }
}
</style>