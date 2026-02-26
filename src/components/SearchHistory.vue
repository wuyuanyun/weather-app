<template>
  <div class="history-section" v-if="history.length > 0">
    <div class="history-header">
      <h3>🕒 最近搜索</h3>
      <el-button type="danger" link @click="handleClear" size="small">
        清空
      </el-button>
    </div>
    
    <div class="history-list">
      <div 
        v-for="item in history" 
        :key="item.id"
        class="history-item"
        @click="handleSelect(item)"
      >
        <!-- 城市信息 - 显示更详细 -->
        <div class="history-info">
          <span class="city-name">{{ item.name }}</span>
          <span class="city-full">{{ item.displayName || item.fullName }}</span>
        </div>
        
        <!-- 时间和删除 -->
        <div class="history-meta">
          <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          <el-icon 
            class="delete-icon" 
            @click.stop="handleDelete(item.id)"
            :size="16"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Close } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['select', 'delete', 'clear'])

// 选择城市
const handleSelect = (item) => {
  emit('select', item)
}

// 删除单条
const handleDelete = (id) => {
  ElMessageBox.confirm('删除这条记录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    emit('delete', id)
  }).catch(() => {})
}

// 清空所有
const handleClear = () => {
  ElMessageBox.confirm('清空所有历史记录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emit('clear')
  }).catch(() => {})
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date
  
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }
  
  // 今天内
  if (date.toDateString() === now.toDateString()) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}小时前`
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  }
  
  // 更早
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<style scoped>
.history-section {
  margin: 20px auto;
  max-width: 600px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 10px;
}

.history-header h3 {
  font-size: 1rem;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.history-list {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: #f5f7fa;
  transform: translateX(5px);
}

.history-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.city-name {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.city-full {
  font-size: 0.8rem;
  color: #999;
  margin-top: 2px;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #999;
  font-size: 0.8rem;
}

.delete-icon {
  cursor: pointer;
  color: #999;
  transition: all 0.2s ease;
  padding: 4px;
  border-radius: 50%;
}

.delete-icon:hover {
  color: #f56c6c;
  background: #fef0f0;
  transform: scale(1.1);
}

/* 响应式 */
@media (max-width: 600px) {
  .history-section {
    margin: 15px auto;
  }
  
  .history-item {
    padding: 10px 12px;
  }
  
  .city-name {
    font-size: 1rem;
  }
}
</style>