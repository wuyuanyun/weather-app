import axios from 'axios'
import config from './config'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
    timeout: config.timeout,
    // 设置基础URL - 使用和风天气提供的主机
    baseURL: `https://${config.qweather.host}`
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 打印请求信息（调试用）
        if (config.debug !== false) {
            console.log('🌤️ 请求地址:', `${config.baseURL}${config.url}`)
            console.log('📦 请求参数:', config.params)
        }
        return config
    },
    error => {
        console.error('❌ 请求错误：', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        const res = response.data

        // 打印响应（调试用）
        if (config.debug) {
            console.log('✅ 响应数据:', res)
        }

        // 空气质量API可能返回不同格式，需要特殊处理
        // 这里我们先不做统一code检查，让具体方法处理

        return res
    },
    error => {
        console.error('❌ 响应错误：', error)

        if (error.message.includes('timeout')) {
            ElMessage.error('请求超时，请检查网络')
        } else if (error.message.includes('Network')) {
            ElMessage.error('网络连接失败')
        } else {
            ElMessage.error('服务器异常，请稍后重试')
        }

        return Promise.reject(error)
    }
)

// 和风天气API封装
class WeatherAPI {
    constructor() {
        this.key = config.qweather.key
        this.paths = config.qweather.paths
        this.debug = config.debug
    }

    // 打印调试信息
    log(method, params, result) {
        if (this.debug) {
            console.log(`[WeatherAPI] ${method}:`, {
                params,
                result
            })
        }
    }

    // 城市搜索 - 使用你提供的路径 /geo/v2/city/lookup
    async searchCity(cityName) {
        if (!cityName) {
            throw new Error('城市名不能为空')
        }

        try {
            console.log('🔍 搜索城市:', cityName)

            const response = await service.get(this.paths.geo, {
                params: {
                    location: cityName,
                    key: this.key
                }
            })

            this.log('searchCity', { cityName }, response)

            if (response.code === '200' && response.location && response.location.length > 0) {
                // 返回第一个匹配的城市
                // 返回所有匹配的城市，让用户选择
                const locations = response.location.map(location => ({
                    id: location.id,
                    name: location.name,
                    adm1: location.adm1,
                    adm2: location.adm2,
                    country: location.country,
                    lat: location.lat,
                    lon: location.lon,
                    type: location.type,
                    fullName: this.formatCityFullName(location)
                }))

                return locations  // 返回数组，不只是第一个
            } else {
                throw new Error('未找到该城市')
            }
        } catch (error) {
            console.error('❌ 城市搜索失败：', error)
            throw error
        }
    }

    // 获取实时天气 - /v7/weather/now
    async getCurrentWeather(locationId) {
        if (!locationId) {
            throw new Error('Location ID不能为空')
        }

        try {
            const response = await service.get(this.paths.weather, {
                params: {
                    location: locationId,
                    key: this.key
                }
            })

            this.log('getCurrentWeather', { locationId }, response)

            if (response.code === '200') {
                return {
                    ...response.now,
                    updateTime: response.updateTime
                }
            } else {
                throw new Error('获取天气失败')
            }
        } catch (error) {
            console.error('❌ 获取实时天气失败：', error)
            throw error
        }
    }

    // 获取3天预报 - /v7/weather/3d
    async get3dWeather(locationId) {
        if (!locationId) {
            throw new Error('Location ID不能为空')
        }

        try {
            const response = await service.get(this.paths.weather3d, {
                params: {
                    location: locationId,
                    key: this.key
                }
            })

            this.log('get3dWeather', { locationId }, response)

            if (response.code === '200') {
                return {
                    daily: response.daily,
                    updateTime: response.updateTime
                }
            } else {
                throw new Error('获取预报失败')
            }
        } catch (error) {
            console.error('❌ 获取预报失败：', error)
            throw error
        }
    }

    // 获取7天预报 - /v7/weather/7d
    async get7dWeather(locationId) {
        if (!locationId) {
            throw new Error('Location ID不能为空')
        }

        try {
            const response = await service.get(this.paths.weather7d, {
                params: {
                    location: locationId,
                    key: this.key
                }
            })

            this.log('get7dWeather', { locationId }, response)

            if (response.code === '200') {
                return {
                    daily: response.daily,
                    updateTime: response.updateTime
                }
            } else {
                throw new Error('获取预报失败')
            }
        } catch (error) {
            console.error('❌ 获取预报失败：', error)
            throw error
        }
    }
    // 格式化城市完整名称
    formatCityFullName(location) {
        const parts = []
        if (location.name) parts.push(location.name)
        if (location.adm1) parts.push(location.adm1)
        if (location.country) parts.push(location.country)
        return parts.join(', ')
    }
    /**
     * 获取空气质量：/airquality/v1/current/{lat}/{lon}?key=你的key
     * @param {number} lat - 纬度
     * @param {number} lon - 经度
     */
    async getAirQuality(lat, lon) {
        if (!lat || !lon) {
            console.warn('⚠️ 缺少经纬度，无法获取空气质量')
            return null
        }

        try {
            // 构建URL: /airquality/v1/current/39.90/116.40?key=xxx
            const url = `${this.paths.air}/${lat}/${lon}`

            console.log('🌫️ 请求空气质量:', url)

            const response = await service.get(url, {
                params: {
                    key: this.key
                }
            })

            this.log('getAirQuality', { lat, lon }, response)

            // 空气质量API可能返回不同的格式，根据实际返回结构调整
            // 如果返回的是错误
            if (response.code && response.code !== '200') {
                console.warn('⚠️ 空气质量API返回错误:', response.code)
                return null
            }

            // 返回空气质量数据
            return response

        } catch (error) {
            console.error('❌ 获取空气质量失败：', error)
            return null  // 失败时返回null，不影响主流程
        }
    }

    // 修改为接收城市信息对象，而不是城市名
    async getCompleteWeatherByCity(cityInfo, days = 3) {
        try {
            console.log('🚀 开始获取天气数据，城市:', cityInfo)

            // 并发请求
            const promises = [
                this.getCurrentWeather(cityInfo.id),
                days === 7 ? this.get7dWeather(cityInfo.id) : this.get3dWeather(cityInfo.id),
                this.getAirQuality(cityInfo.lat, cityInfo.lon)
            ]

            const [current, forecast, air] = await Promise.all(promises)

            return {
                city: cityInfo,  // 直接使用传入的城市信息
                current: current,
                forecast: forecast,
                air: air,
                timestamp: Date.now()
            }

        } catch (error) {
            console.error('❌ 获取天气失败：', error)
            throw error
        }
    }

    // 保留原有的方法用于直接搜索
    async getCompleteWeather(cityName, days = 3) {
        // 先搜索城市
        const cities = await this.searchCity(cityName)
        if (!cities || cities.length === 0) {
            throw new Error('未找到该城市')
        }

        // 如果有多个匹配，返回列表让用户选择
        if (cities.length > 1) {
            return {
                multiple: true,
                cities: cities,
                originalQuery: cityName
            }
        }

        // 只有一个匹配，直接获取天气
        return this.getCompleteWeatherByCity(cities[0], days)
    }
}

// 创建单例实例
const weatherAPI = new WeatherAPI()

export default weatherAPI