// API配置
const config = {
    qweather: {
        // 从环境变量读取
        key: import.meta.env.VITE_QWEATHER_KEY,
        host: import.meta.env.VITE_QWEATHER_HOST,

        // 接口路径
        paths: {
            geo: '/geo/v2/city/lookup',
            weather: '/v7/weather/now',
            weather3d: '/v7/weather/3d',
            weather7d: '/v7/weather/7d',
            air: '/airquality/v1/current'
        }
    },
    timeout: import.meta.env.VITE_API_TIMEOUT,
    debug: import.meta.env.VITE_APP_DEBUG === 'true'
}

export default config