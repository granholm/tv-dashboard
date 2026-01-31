<template>
  <div class="h-full flex flex-col justify-between" v-if="weather">
    <!-- Current Weather Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <!-- Icon Placeholder or Component -->
        <div class="text-6xl mr-6">{{ getWeatherIcon(weather.state) }}</div>
        <div>
          <div class="text-6xl font-bold">{{ weather.attributes.temperature }}°</div>
          <div class="text-xl text-slate-400 capitalize">{{ weather.state }}</div>
        </div>
      </div>
      <div class="text-right">
        <div class="flex flex-col text-sm text-slate-400 space-y-1">
          <div class="flex items-center justify-end">
            <span class="mr-2">Sunrise</span>
            <span class="text-white">{{ formatTime(sun?.attributes?.next_rising) }}</span>
          </div>
          <div class="flex items-center justify-end">
            <span class="mr-2">Sunset</span>
            <span class="text-white">{{ formatTime(sun?.attributes?.next_setting) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3-Day Forecast -->
    <div class="grid grid-cols-3 gap-4 mt-6">
      <div v-for="(day, index) in forecastList" :key="index" 
           class="bg-slate-700/50 rounded-lg p-3 text-center flex flex-col items-center">
        <div class="text-slate-400 text-sm mb-1">{{ getDayName(day.datetime) }}</div>
        <div class="text-2xl mb-1">{{ getWeatherIcon(day.condition) }}</div>
        <div class="text-lg font-bold">{{ day.temperature }}°</div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center text-slate-500">
    Loading Weather...
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  weather: Object,
  sun: Object
});

const forecastList = computed(() => {
  if (!props.weather?.attributes?.forecast) return [];
  return props.weather.attributes.forecast.slice(0, 3);
});

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDayName = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Simple mapping for text-based icons (replace with SVG or Image assets)
const getWeatherIcon = (condition) => {
  const map = {
    'sunny': '☀️',
    'clear': '🌙',
    'partlycloudy': '⛅',
    'cloudy': '☁️',
    'rainy': 'wm',
    'pouring': '🌧️',
    'snowy': '❄️',
    'lightning': '⚡'
  };
  return map[condition?.toLowerCase()] || '❓';
};
</script>
