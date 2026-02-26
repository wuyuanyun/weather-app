import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 配置
const MAX_HISTORY = 5
const STORAGE_KEY = 'weather_search_history'

export function useSearchHistory() {
    // 历史记录数据
    const searchHistory = ref([])

    // 从localStorage加载
    const loadHistory = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                searchHistory.value = JSON.parse(saved)
                console.log('📚 加载历史记录:', searchHistory.value)
            }
        } catch (error) {
            console.error('加载历史记录失败:', error)
        }
    }

    // 保存到localStorage
    const saveHistory = (history) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
        } catch (error) {
            console.error('保存历史记录失败:', error)
        }
    }

    // 添加搜索记录
    const addSearchRecord = (cityInfo) => {
        if (!cityInfo || !cityInfo.id) return

        // 创建记录
        const record = {
            id: cityInfo.id,           // 城市ID（最重要！）
            name: cityInfo.name,        // 城市名（如：旧金山）
            fullName: cityInfo.fullName, // 完整名称（如：旧金山, 加利福尼亚, 美国）
            country: cityInfo.country,   // 国家
            adm1: cityInfo.adm1,         // 省份/州
            lat: cityInfo.lat,           // 纬度（备用）
            lon: cityInfo.lon,           // 经度（备用）
            displayName: cityInfo.fullName || `${cityInfo.name}${cityInfo.country ? ', ' + cityInfo.country : ''}`,
            timestamp: Date.now()
        }

        // 移除重复的城市
        searchHistory.value = searchHistory.value.filter(item => item.id !== cityInfo.id)

        // 添加到开头
        searchHistory.value.unshift(record)

        // 限制数量
        if (searchHistory.value.length > MAX_HISTORY) {
            searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY)
        }

        // 保存
        saveHistory(searchHistory.value)
        console.log('✅ 添加历史记录:', record)
    }

    // 删除单条记录
    const removeHistoryItem = (id) => {
        searchHistory.value = searchHistory.value.filter(item => item.id !== id)
        saveHistory(searchHistory.value)
        ElMessage.success('已删除')
    }

    // 清空所有记录
    const clearHistory = () => {
        searchHistory.value = []
        localStorage.removeItem(STORAGE_KEY)
        ElMessage.success('已清空历史记录')
    }

    // 初始化加载
    loadHistory()

    return {
        searchHistory,
        addSearchRecord,
        removeHistoryItem,
        clearHistory
    }
}