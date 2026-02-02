<template>
  <div class="h-full flex flex-col justify-between" v-if="weather">
    <!-- Main Section: Weather & Details -->
    <div class="flex-1 flex items-center justify-center gap-12 min-h-0 pt-2 px-">
      
      <!-- Left: Weather State -->
      <div class="flex items-center gap-8 ml-16">
        <div class="text-7xl text-white filter drop-shadow-md">
          <svg class="w-24 h-24" viewBox="0 0 24 24" fill="currentColor">
            <path :d="getWeatherIconPath(weather.state)" />
          </svg>
        </div>
        <div>
          <div class="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">
            {{ weather.attributes.temperature }}°
          </div>
          <div class="text-2xl text-slate-400 font-medium tracking-wide capitalize pl-2">
            {{ weather.state }}
          </div>
        </div>
      </div>

      <!-- Integrated Details -->
      <div class="flex items-center gap-10 px-10 border-l border-r border-slate-700/50 mx-4">
        <!-- Wind -->
        <div class="flex flex-col items-center group min-w-[5rem]">
          <div class="flex items-center gap-2 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 10h9.5c1.66 0 3-1.34 3-3s-1.34-3-3-3h-2c-0.55 0-1-0.45-1-1s0.45-1 1-1h2c2.76 0 5 2.24 5 5s-2.24 5-5 5h-9.5v-2zm12 4h-7.5c-2.76 0-5 2.24-5 5s2.24 5 5 5h4c0.55 0 1-0.45 1-1s-0.45-1-1-1h-4c-1.66 0-3-1.34-3-3s1.34-3 3-3h7.5v-2z" />
            </svg>
             <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Wind</span>
          </div>
          <div class="text-xl font-bold">{{ weather.attributes.wind_speed }} <span class="text-sm font-normal text-slate-500">m/s</span></div>
          <div class="text-xs text-blue-400 font-medium flex items-center mt-0.5">
             <span class="inline-block transform transition-transform duration-500" :style="{ transform: `rotate(${weather.attributes.wind_bearing}deg)` }">↓</span>
             <span class="ml-1">{{ getWindCardinal(weather.attributes.wind_bearing) }}</span>
          </div>
        </div>

        <!-- Pressure -->
        <div class="flex flex-col items-center group min-w-[5rem]">
          <div class="flex items-center gap-2 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8 8-8zm-1-12h2v4.25l2.6 1.5-1 1.73-3.6-2.08v-5.4z" />
            </svg>
             <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Baro</span>
          </div>
          <div class="text-xl font-bold">{{ weather.attributes.pressure }}</div>
          <span class="text-xs text-slate-500">hPa</span>
        </div>

        <!-- Sun Phase -->
        <div class="flex flex-col items-center group px-2">
           <div class="flex items-center gap-2 mb-1 opacity-70 group-hover:opacity-100 transition-opacity">
             <svg class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 9c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
             </svg>
             <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Sun</span>
           </div>
           
           <div class="flex items-center gap-6">
             <div class="flex flex-col items-center">
                <span class="text-xl font-bold text-yellow-400">{{ formatTime(sun?.attributes?.next_rising) }}</span>
                <span class="text-xs text-slate-500">Rise</span>
             </div>
             <div class="w-px h-8 bg-slate-700"></div>
             <div class="flex flex-col items-center">
                <span class="text-xl font-bold text-orange-400">{{ formatTime(sun?.attributes?.next_setting) }}</span>
                <span class="text-xs text-slate-500">Set</span>
             </div>
           </div>
        </div>
      </div>
    </div>

    <!-- Bottom: Hourly Forecast -->
    <div class="mt-6 border-t border-slate-700/50 pt-4 -mx-2 px-2"> <!-- Added margin logic for aesthetics -->
      <div class="flex overflow-x-auto space-x-2 pb-1 scrollbar-hide mask-fade-sides">
        <div v-for="(item, index) in forecastList" :key="index" 
             class="flex-shrink-0 w-20 py-3 rounded-xl flex flex-col items-center justify-center transition-all bg-slate-800/40 hover:bg-slate-700/60 border border-transparent hover:border-slate-600/50">
          <div class="text-slate-400 text-xs mb-2 font-medium">{{ getHour(item.datetime) }}</div>
          <div class="mb-2 drop-shadow-sm">
            <svg class="w-8 h-8 text-slate-200" viewBox="0 0 24 24" fill="currentColor">
               <path :d="getWeatherIconPath(item.condition)" />
            </svg>
          </div>
          <div class="text-lg font-bold">{{ Math.round(item.temperature) }}°</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center text-slate-500 animate-pulse">
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
