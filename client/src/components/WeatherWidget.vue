<template>
  <div class="h-full flex flex-col justify-between" v-if="weather">
    <!-- Top Section: Current Weather & Clock -->
    <div class="flex items-start justify-between">
      <!-- Left: Weather State -->
      <div class="flex items-center pt-2">
        <div class="text-7xl mr-6">
          <svg class="w-20 h-20 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path :d="getWeatherIconPath(weather.state)" />
          </svg>
        </div>
        <div>
          <div class="text-7xl font-bold">{{ weather.attributes.temperature }}°</div>
          <div class="text-2xl text-slate-400 capitalize">{{ weather.state }}</div>
        </div>
      </div>
      
      <!-- Right: Clock -->
      <div class="text-right pt-2">
        <div class="text-6xl font-bold tracking-tight">{{ currentTime }}</div>
        <div class="text-xl text-slate-400">{{ currentDate }}</div>
      </div>
    </div>

    <!-- Middle Section: Details Grid -->
    <div class="grid grid-cols-4 gap-6 mt-4 mb-2">
      <!-- Wind -->
      <div class="bg-slate-700/30 rounded-xl p-3 flex flex-col items-center justify-center">
        <div class="text-slate-400 text-sm uppercase tracking-wider mb-1">Wind</div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl">💨</span>
          <div class="flex flex-col items-start leading-none">
            <span class="text-xl font-bold">{{ weather.attributes.wind_speed }} <span class="text-sm font-normal text-slate-400">m/s</span></span>
            <span class="text-xs text-slate-400 flex items-center mt-1">
              <span class="inline-block transform origin-center transition-transform duration-500" :style="{ transform: `rotate(${weather.attributes.wind_bearing}deg)` }">↓</span>
              <span class="ml-1">{{ getWindCardinal(weather.attributes.wind_bearing) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Pressure -->
      <div class="bg-slate-700/30 rounded-xl p-3 flex flex-col items-center justify-center">
        <div class="text-slate-400 text-sm uppercase tracking-wider mb-1">Pressure</div>
        <div class="flex items-center space-x-2">
          <span class="text-2xl">🧭</span>
          <div class="flex flex-col items-start leading-none">
            <span class="text-xl font-bold">{{ weather.attributes.pressure }}</span>
            <span class="text-sm text-slate-400">hPa</span>
          </div>
        </div>
      </div>

      <!-- Sunrise -->
      <div class="bg-slate-700/30 rounded-xl p-3 flex flex-col items-center justify-center">
         <div class="text-slate-400 text-sm uppercase tracking-wider mb-1">Sunrise</div>
         <div class="flex items-center space-x-2">
           <svg class="w-8 h-8 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
             <path d="M20 18H4v-2h16v2zM12 5L4 13h5v3h6v-3h5L12 5z" />
           </svg>
           <span class="text-2xl font-bold">{{ formatTime(sun?.attributes?.next_rising) }}</span>
         </div>
      </div>

      <!-- Sunset -->
      <div class="bg-slate-700/30 rounded-xl p-3 flex flex-col items-center justify-center">
         <div class="text-slate-400 text-sm uppercase tracking-wider mb-1">Sunset</div>
         <div class="flex items-center space-x-2">
           <svg class="w-8 h-8 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
             <path d="M20 18H4v-2h16v2zM12 16l8-8h-5V5H9v3H4l8 8z" />
           </svg>
           <span class="text-2xl font-bold">{{ formatTime(sun?.attributes?.next_setting) }}</span>
         </div>
      </div>
    </div>

    <!-- Bottom: Hourly Forecast -->
    <div class="mt-2 -mx-2">
      <div class="flex overflow-x-auto space-x-3 pb-2 px-2 scrollbar-hide">
        <div v-for="(item, index) in forecastList" :key="index" 
             class="flex-shrink-0 w-20 bg-slate-700/50 rounded-lg p-2 text-center flex flex-col items-center snap-start">
          <div class="text-slate-400 text-xs mb-1">{{ getHour(item.datetime) }}</div>
          <div class="mb-1">
            <svg class="w-8 h-8 mx-auto text-slate-300" viewBox="0 0 24 24" fill="currentColor">
               <path :d="getWeatherIconPath(item.condition)" />
            </svg>
          </div>
          <div class="text-base font-bold">{{ Math.round(item.temperature) }}°</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center text-slate-500">
    Loading Weather...
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { weatherIcons } from './weatherIconList.js';

const props = defineProps({
  weather: Object,
  sun: Object
});

const currentTime = ref('');
const currentDate = ref('');
let clockInterval;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  currentDate.value = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  clearInterval(clockInterval);
});

const forecastList = computed(() => {
  if (!props.weather?.attributes?.forecast) return [];
  // Return next 24 hours (or available forecast items)
  return props.weather.attributes.forecast.slice(0, 24);
});

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getHour = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getWindCardinal = (degrees) => {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round((degrees % 360) / 45);
  return cardinals[index % 8];
};

const getWeatherIconPath = (condition) => {
  if (!condition) return weatherIcons.default;
  const normalized = condition.toLowerCase().replace(/\s+/g, '-');
  return weatherIcons[normalized] || weatherIcons.default;
};
</script>
