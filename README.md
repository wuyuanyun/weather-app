🌤️ 天气应用 - 和风天气API
一个基于 Vue 3 + Vite + Element Plus 开发的响应式天气预报应用，使用和风天气API。支持城市搜索、实时天气、3天预报、空气质量监测、最近搜索历史等功能。项目结构清晰，封装了API层、组合式函数，并处理了同名城市、错误边界等实际场景。
🔗 在线演示： https://weather-app.vercel.app （请替换为你的真实地址）
--------------------------------------------------------------------------------
📸 截图
桌面端移动端

截图占位，请将实际截图放在 screenshots/ 目录下。

--------------------------------------------------------------------------------
✨ 功能特点
- 🔍 智能城市搜索 - 支持中英文城市名，当API返回多个同名城市时弹出选择框（例如“旧金山”可区分美国/危地马拉）。
- 🌡️ 实时天气 - 显示温度、体感温度、天气状况、湿度、降水、风向风力、气压、能见度。
- 📅 3天预报 - 未来三天的天气、温度范围、风力，移动端优化为列表展示。
- 🌫️ 空气质量 - 展示AQI指数、等级、健康建议、主要污染物浓度及监测站信息。
- 🕒 最近搜索历史 - 使用 localStorage 保存最近5条记录，点击可重新搜索，支持单条删除和清空。
- 🌙 智能背景 - 根据天气类型（晴/雨/雪）和昼夜时间自动切换背景渐变。
- 📱 响应式设计 - 完美适配手机、平板和桌面端，组件布局自动调整。
- ⚠️ 完善的错误处理 - API错误统一拦截，使用 Promise.allSettled 保证部分失败不影响整体显示。
--------------------------------------------------------------------------------
🛠️ 技术栈
- 核心框架：Vue 3 (Composition API + <script setup>)
- 构建工具：Vite
- UI组件库：Element Plus
- HTTP客户端：Axios（拦截器、重试机制）
- 状态管理：localStorage + 组合式函数 (Composables)
- 样式：CSS3 (Flex/Grid, 媒体查询, 动画)
- 代码规范：ESLint + Prettier
--------------------------------------------------------------------------------
📁 项目结构
weather-app/
├── public/                 # 静态资源
├── screenshots/            # 截图（自行添加）
├── src/
│   ├── api/
│   │   ├── config.js       # API配置（需填写Key）
│   │   └── weather.js      # 和风天气API封装
│   ├── components/
│   │   ├── AirQuality.vue
│   │   ├── CurrentWeather.vue
│   │   ├── SearchCity.vue
│   │   ├── SearchHistory.vue
│   │   ├── WeatherCard.vue
│   │   └── WeatherForecast.vue
│   ├── composables/
│   │   └── useSearchHistory.js  # 历史记录逻辑
│   ├── utils/
│   │   └── weatherIcons.js      # 天气图标映射
│   ├── App.vue
│   └── main.js
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js

--------------------------------------------------------------------------------
🚀 快速开始
环境要求
- Node.js 16+
- npm 或 pnpm
安装步骤
1.克隆仓库
git clone https://gitee.com/bing15_23/weather-app.git
2.安装依赖
npm install
# 或
pnpm install
3.配置API密钥
- 复制配置文件示例：
cp src/api/config.example.js src/api/config.js
- 在 config.js 中填入你的和风天气API Key（需要先注册和风天气开发者）
VITE_QWEATHER_KEY=你的KEY
VITE_QWEATHER_HOST=你的API域名
4.启动开发服务器
npm run dev
访问 http://localhost:5173
5.构建生产版本
npm run build
--------------------------------------------------------------------------------
🔧 配置说明
和风天气API
本项目使用的接口：
- 城市搜索：/geo/v2/city/lookup
- 实时天气：/v7/weather/now
- 3天预报：/v7/weather/3d
- 空气质量：/airquality/v1/current/{lat}/{lon}
你需要在 config.js 中配置正确的域名和路径。示例：
export default {
  qweather: {
    key: 'your_key_here',
    host: 'your_api_host',          // 例如 jp436h93hk.re.qweatherapi.com
    paths: {
      geo: '/geo/v2/city/lookup',
      weather: '/v7/weather/now',
      weather3d: '/v7/weather/3d',
      weather7d: '/v7/weather/7d',
      air: '/airquality/v1/current'
    }
  }
}

--------------------------------------------------------------------------------
🌐 部署
本项目可一键部署到 Vercel：
1.将代码推送到 GitHub/Gitee。
2.在 Vercel 中导入该仓库。
3.添加环境变量（如果使用）：
- VITE_QWEATHER_KEY
- VITE_QWEATHER_HOST
4.点击部署，获得线上地址。
其他平台（如 Netlify、GitHub Pages）同样支持。
--------------------------------------------------------------------------------
📄 许可证

--------------------------------------------------------------------------------
🙏 致谢
- 构建工具：和风天气
- UI组件库：Element Plus
- 构建工具：
- Vite