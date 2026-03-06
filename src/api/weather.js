import axios from 'axios'
import config from './config'

// 创建axios实例
const service = axios.create({
    timeout: config.timeout,
    baseURL: `https://${config.qweather.host}`,
    retry: 3,
    retryDelay: 1000
})

// 请求拦截器
service.interceptors.request.use(
    config => {
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

// 响应拦截器 - 只转换错误，不弹窗
service.interceptors.response.use(
    response => {
        const res = response.data

        if (config.debug) {
            console.log('✅ 响应数据:', res)
        }

        // API业务错误码检查 - 转换为错误对象，但不弹窗
        if (res.code && res.code !== '200') {
            const errorMsg = getApiErrorMessage(res.code)
            // 创建一个包含错误信息的对象
            const error = new Error(`API错误: ${errorMsg}`)
            error.apiCode = res.code
            error.apiMessage = errorMsg
            error.response = res
            return Promise.reject(error)
        }

        return res
    },
    error => {
        console.error('❌ 响应错误：', error)

        // 增强错误信息，但不弹窗
        if (error.message.includes('timeout')) {
            error.userMessage = '请求超时，请检查网络'
            error.type = 'timeout'
        } else if (error.message.includes('Network')) {
            error.userMessage = '网络连接失败'
            error.type = 'network'
        } else if (error.response) {
            const status = error.response.status
            if (status === 401) {
                error.userMessage = 'API密钥无效'
            } else if (status === 403) {
                error.userMessage = '禁止访问'
            } else if (status === 404) {
                error.userMessage = '接口不存在'
            } else if (status >= 500) {
                error.userMessage = '服务器错误，请稍后重试'
            } else {
                error.userMessage = `请求失败 (${status})`
            }
            error.type = 'http'
            error.httpStatus = status
        } else {
            error.userMessage = '服务器异常，请稍后重试'
            error.type = 'unknown'
        }

        return Promise.reject(error)
    }
)

// 重试机制
service.interceptors.response.use(null, async (error) => {
    const config = error.config

    if (!config || !config.retry || config.__isRetry) {
        return Promise.reject(error)
    }

    config.__isRetry = true
    config.retryCount = config.retryCount || 0

    if (config.retryCount >= config.retry) {
        return Promise.reject(error)
    }

    config.retryCount += 1
    console.log(`🔄 重试请求 (${config.retryCount}/${config.retry}):`, config.url)

    await new Promise(resolve => setTimeout(resolve, config.retryDelay))
    return service(config)
})

// 获取API错误码的对应信息
function getApiErrorMessage(code) {
    const errorMap = {
        '204': '请求成功，但你查询的地区暂时没有你需要的数据',
        '400': '请求错误，可能包含错误的请求参数',
        '401': '认证失败，可能使用了错误的KEY',
        '402': '超过访问次数或余额不足以支持继续访问服务',
        '403': '无访问权限，可能是绑定的PackageName或BundleID错误',
        '404': '查询的数据或地区不存在',
        '429': '超过限定的QPM（每分钟访问次数）',
        '500': '无响应或超时'
    }
    return errorMap[code] || '未知错误'
}

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

    // 城市搜索 - /geo/v2/city/lookup
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

                return locations
            } else {
                return [] // 返回空数组
            }
        } catch (error) {
            console.error('❌ 城市搜索失败：', error)
            // 增强错误信息
            error.context = 'searchCity'
            error.userMessage = error.userMessage || '城市搜索失败'
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
                // 返回null，但记录原因
                console.warn('获取实时天气失败: API返回非200', response.code)
                return null
            }
        } catch (error) {
            console.error('❌ 获取实时天气失败：', error)
            error.context = 'getCurrentWeather'
            error.userMessage = error.userMessage || '获取实时天气失败'
            throw error  // 抛出错误，让上层决定如何处理
        }
    }

    // 获取3天预报
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
                console.warn('获取3天预报失败: API返回非200', response.code)
                return null
            }
        } catch (error) {
            console.error('❌ 获取3天预报失败：', error)
            error.context = 'get3dWeather'
            error.userMessage = error.userMessage || '获取预报失败'
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
                console.warn('获取7天预报失败: API返回非200', response.code)
                return null
            }
        } catch (error) {
            console.error('❌ 获取7天预报失败：', error)
            error.context = 'get7dWeather'
            error.userMessage = error.userMessage || '获取预报失败'
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
            const url = `${this.paths.air}/${lat}/${lon}`

            console.log('🌫️ 请求空气质量:', url)

            const response = await service.get(url, {
                params: {
                    key: this.key
                }
            })

            this.log('getAirQuality', { lat, lon }, response)

            // 空气质量API可能返回不同格式
            return response

        } catch (error) {
            console.error('❌ 获取空气质量失败：', error)
            error.context = 'getAirQuality'
            error.userMessage = error.userMessage || '获取空气质量失败'
            throw error  // 抛出错误
        }
    }

    // 接收城市信息对象，获取完整天气数据
    async getCompleteWeatherByCity(cityInfo, days = 3) {
        // 收集错误信息
        const errors = []

        // 默认返回值
        const result = {
            city: cityInfo,
            current: null,
            forecast: null,
            air: null,
            errors: null,
            timestamp: Date.now()
        }

        try {
            console.log('🚀 开始获取天气数据，城市:', cityInfo)

            // 并发请求，使用Promise.allSettled确保单个失败不影响整体
            const promises = [
                this.getCurrentWeather(cityInfo.id).catch(err => {
                    errors.push({ api: '实时天气', error: err.userMessage || err.message })
                    return null
                }),
                (days === 7 ? this.get7dWeather(cityInfo.id) : this.get3dWeather(cityInfo.id)).catch(err => {
                    errors.push({ api: '预报天气', error: err.userMessage || err.message })
                    return null
                }),
                this.getAirQuality(cityInfo.lat, cityInfo.lon).catch(err => {
                    errors.push({ api: '空气质量', error: err.userMessage || err.message })
                    return null
                })
            ]

            const [current, forecast, air] = await Promise.all(promises)

            result.current = current
            result.forecast = forecast
            result.air = air
            result.errors = errors.length > 0 ? errors : null

            return result

        } catch (error) {
            console.error('❌ 获取天气失败：', error)
            result.errors = errors.length > 0 ? errors : [{ api: '系统', error: error.message }]
            return result  // 总是返回数据，即使有错误
        }
    }

    // 通过城市名获取完整天气（支持多城市选择）
    async getCompleteWeather(cityName, days = 3) {
        if (!cityName) {
            return {
                success: false,
                error: '城市名不能为空',
                type: 'invalid_input',
                originalQuery: cityName
            }
        }

        try {
            // 先搜索城市
            const cities = await this.searchCity(cityName)

            if (!cities || cities.length === 0) {
                return {
                    success: false,
                    error: '未找到该城市',
                    type: 'not_found',
                    originalQuery: cityName
                }
            }

            // 在 weatherAPI.getCompleteWeather 中
            if (cities.length > 1) {
                return {
                    multiple: true,  // 保持 multiple 标志
                    cities: cities,
                    originalQuery: cityName
                }
            }

            // 只有一个城市
            return await this.getCompleteWeatherByCity(cities[0], days)  // 直接返回数据
        } catch (error) {
            console.error('❌ 获取天气失败：', error)
            return {
                success: false,
                error: error.userMessage || error.message || '获取天气失败',
                type: 'error',
                originalQuery: cityName
            }
        }
    }

    // 快捷方法：直接获取单个城市的天气
    async getWeather(cityName, days = 3) {
        const result = await this.getCompleteWeather(cityName, days)

        if (result.success && result.type === 'weather_data') {
            return result.data
        } else if (result.success && result.type === 'multiple_cities') {
            console.warn(`⚠️ 找到多个匹配城市，使用第一个: ${result.cities[0].fullName}`)
            return this.getCompleteWeatherByCity(result.cities[0], days)
        } else {
            throw new Error(result.error || '获取天气失败')
        }
    }
}

// 创建单例实例
const weatherAPI = new WeatherAPI()

export default weatherAPI