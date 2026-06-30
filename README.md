天气应用 - 和风天气API
一个基于 Vue 3 + Vite + Element Plus 开发的响应式天气预报应用，使用和风天气API。支持城市搜索、实时天气、3天预报、空气质量监测、最近搜索历史等功能。项目结构清晰，封装了API层、组合式函数，并处理了同名城市、错误边界等实际场景。

进阶：更改样式+添加后端
新增整合通义千问大模型，实现千人千面的AI生活建议。
全栈架构：Vue3 + Vite + Element Plus + SpringBoot 3.2 + MyBatis + MySQL
--------------------------------------------------------------------------------
进阶界面展示：
注：图片背景是收集网上素材搭配豆包生成，在此只做学习展示。

添加个人习惯界面
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/af519f45-c481-413d-9812-9523e162f643" />

主页（不同天气情况的ai提醒以及背景）
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/49eeef8f-bb5c-4137-9689-6bb2688d6a05" />
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/920d705d-91b4-4741-850a-3d3de7a17c8b" />
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/d516545a-6e88-4a93-ab81-f12816b7a5db" />
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/49515617-3547-478d-9837-d519289a0ce7" />


搜索
<img width="1920" height="1140" alt="image" src="https://github.com/user-attachments/assets/399567cd-5dbe-46ef-a360-1189d142e394" />

初始界面：
<img width="555" height="1039" alt="image" src="https://github.com/user-attachments/assets/51d651a7-16fb-4e68-9040-42f8ac590c19" />
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
🙏 致谢
- 构建工具：和风天气
- UI组件库：Element Plus
- 构建工具：
- Vite
