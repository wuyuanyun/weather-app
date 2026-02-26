<template>
  <!-- 替换成你的天气组件 -->
  <div class="weather-home">
    <h1>天气查询应用</h1>
    <SearchCity /> <!-- 你的搜索城市组件 -->
    <WeatherInfo /> <!-- 你的天气展示组件 -->
  </div>
</template>

<script setup>
import SearchCity from '../components/SearchCity.vue'
</script>