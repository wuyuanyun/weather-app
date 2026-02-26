// 天气图标映射
export const weatherIcons = {
    // 晴天
    '晴': {
        day: '☀️',
        night: '🌙',
        color: '#ffd700'
    },
    // 多云
    '多云': {
        day: '⛅',
        night: '☁️',
        color: '#a0a0a0'
    },
    // 阴天
    '阴': {
        day: '☁️',
        night: '☁️',
        color: '#808080'
    },
    // 雨
    '雨': {
        day: '🌧️',
        night: '🌧️',
        color: '#4682b4'
    },
    '小雨': {
        day: '🌦️',
        night: '🌦️',
        color: '#4682b4'
    },
    '中雨': {
        day: '🌧️',
        night: '🌧️',
        color: '#2e5a8a'
    },
    '大雨': {
        day: '🌧️',
        night: '🌧️',
        color: '#1e3a5f'
    },
    '暴雨': {
        day: '⛈️',
        night: '⛈️',
        color: '#0a1a2a'
    },
    // 雷雨
    '雷': {
        day: '⛈️',
        night: '⛈️',
        color: '#4a2e5a'
    },
    '雷阵雨': {
        day: '⛈️',
        night: '⛈️',
        color: '#4a2e5a'
    },
    // 雪
    '雪': {
        day: '❄️',
        night: '❄️',
        color: '#b0e0e6'
    },
    '小雪': {
        day: '🌨️',
        night: '🌨️',
        color: '#b0e0e6'
    },
    '中雪': {
        day: '❄️',
        night: '❄️',
        color: '#9ac0cd'
    },
    '大雪': {
        day: '❄️',
        night: '❄️',
        color: '#7aa5b5'
    },
    // 雾/霾
    '雾': {
        day: '🌫️',
        night: '🌫️',
        color: '#a9a9a9'
    },
    '霾': {
        day: '🌫️',
        night: '🌫️',
        color: '#8a8a8a'
    },
    // 沙尘
    '沙': {
        day: '💨',
        night: '💨',
        color: '#c0a040'
    },
    '尘': {
        day: '💨',
        night: '💨',
        color: '#c0a040'
    }
}

// 获取天气图标和颜色
export const getWeatherIcon = (text, isDay = true) => {
    if (!text) return { icon: '🌈', color: '#808080' }

    // 遍历查找匹配的天气
    for (const [key, value] of Object.entries(weatherIcons)) {
        if (text.includes(key)) {
            return {
                icon: isDay ? value.day : value.night,
                color: value.color
            }
        }
    }

    // 默认返回
    return { icon: '🌈', color: '#808080' }
}