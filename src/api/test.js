import weatherAPI from './weather'

// 测试函数
async function testWeatherAPI() {
    console.log('='.repeat(50))
    console.log('开始测试天气API')
    console.log('='.repeat(50))

    try {
        // 测试连接
        const testResult = await weatherAPI.testConnection()

        if (testResult.success) {
            console.log('✅ API测试通过！')

            // 单独测试搜索功能
            console.log('\n🔍 测试搜索功能:')
            const city = await weatherAPI.searchCity('上海')
            console.log('搜索结果:', city)

            // 测试实时天气
            console.log('\n🌡️ 测试实时天气:')
            const current = await weatherAPI.getCurrentWeather(city.id)
            console.log('当前天气:', current)

        } else {
            console.log('❌ API测试失败:', testResult.error)
        }

    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error)
    }

    console.log('='.repeat(50))
}

// 执行测试
testWeatherAPI()