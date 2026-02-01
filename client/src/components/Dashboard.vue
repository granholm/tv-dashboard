<template>
  <div class="grid grid-cols-4 grid-rows-3 h-screen w-screen p-6 gap-6 bg-slate-900 text-white font-sans">
    <!-- Top Section (Height: 66%) -->
    <!-- Main Area (Left 75% -> 3 columns) -->
    <div class="col-span-3 row-span-2 bg-slate-800 rounded-2xl shadow-xl overflow-hidden relative border border-slate-700">
      <NewsRotator :news="newsData.featured" :source="newsData.source" />
    </div>

    <!-- Sidebar (Right 25% -> 1 column) -->
    <div class="col-span-1 row-span-2 bg-slate-800 rounded-2xl shadow-xl p-4 overflow-y-auto border border-slate-700 scrollbar-hide">
      <h2 class="text-xl font-bold mb-4 text-slate-300 border-b border-slate-600 pb-2">Latest News</h2>
      <div v-if="newsData.loading" class="text-center py-10 text-slate-500">Loading feeds...</div>
      <ul v-else class="space-y-4">
        <li v-for="(item, index) in newsData.list" :key="index" class="group cursor-pointer">
          <div class="text-xs text-slate-400 mb-1">{{ formatTime(item.pubDate) }}</div>
          <div class="text-sm font-medium group-hover:text-blue-400 transition-colors line-clamp-2">
            {{ item.title }}
          </div>
        </li>
      </ul>
    </div>

    <!-- Bottom Section (Height: 33%) -->
    <!-- Weather Panel (Left 50% -> 2 columns) -->
    <div class="col-span-2 row-span-1 bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
      <WeatherWidget :weather="haData.weather" :sun="haData.sun" />
    </div>

    <!-- Energy Panel (Right 50% -> 2 columns) -->
    <div class="col-span-2 row-span-1 bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700 relative">
      <EnergyWidget :energy="haData.energy" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import NewsRotator from './NewsRotator.vue';
import WeatherWidget from './WeatherWidget.vue';
import EnergyWidget from './EnergyWidget.vue';

const newsData = ref({
  featured: [],
  list: [],
  source: '',
  loading: true
});

const haData = ref({
  weather: null,
  energy: null,
  sun: null,
  loading: true
});

// Helper to format time relative or absolute
const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const fetchData = async () => {
  try {
    // Use relative path for API calls. 
    // In production (served by Node), this works automatically.
    // In development, Vite proxy will handle forwarding to localhost:3000.
    const API_BASE = ''; 

    // Fetch News
    const newsRes = await axios.get(`${API_BASE}/api/news`);
    if (newsRes.data && newsRes.data.items) {
      newsData.value.list = newsRes.data.items.slice(0, 10);
      newsData.value.featured = newsRes.data.items.slice(0, 10); // Use top 10 for rotator
      newsData.value.source = newsRes.data.title;
      newsData.value.loading = false;
    }

    // Fetch HA Data
    const haRes = await axios.get(`${API_BASE}/api/home-assistant`);
    haData.value = { ...haRes.data, loading: false };
    
  } catch (error) {
    console.error("Error fetching data:", error);
    newsData.value.loading = false;
  }
};

let interval;
onMounted(() => {
  fetchData();
  interval = setInterval(fetchData, 600000); // Refresh every 10 mins
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>
