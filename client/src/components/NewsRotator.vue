<template>
  <div class="h-full w-full relative">
    <div v-if="!news || news.length === 0" class="flex items-center justify-center h-full text-slate-500">
      No news available
    </div>
    
    <div v-else class="h-full w-full relative">
      <transition name="fade" mode="out-in">
        <div :key="currentIndex" class="h-full w-full flex flex-col justify-end p-8 bg-cover bg-center"
             :style="{ backgroundImage: currentArticle.image ? `url(${currentArticle.image})` : 'none' }">
          
          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

          <!-- Content -->
          <div class="relative z-10 w-full">
            <h1 class="text-4xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
              {{ currentArticle.title }}
            </h1>
            <p class="text-xl text-slate-300 line-clamp-3 mb-6 max-w-4xl drop-shadow-md">
              {{ currentArticle.contentSnippet || currentArticle.content }}
            </p>
            <div class="flex items-center text-sm text-slate-400">
              <span class="mr-4">{{ source || currentArticle.source || 'News' }}</span>
              <span>{{ formatTime(currentArticle.pubDate) }}</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- Progress Bar -->
      <div class="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-100 ease-linear"
           :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  news: {
    type: Array,
    required: true
  },
  source: String
});

const currentIndex = ref(0);
const progress = ref(0);
const duration = 60000; // 60 seconds
let timer;
let progressTimer;

const currentArticle = computed(() => {
  return props.news[currentIndex.value] || {};
});

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
};

const startRotation = () => {
  clearInterval(timer);
  clearInterval(progressTimer);
  progress.value = 0;
  
  const step = 100;
  const totalSteps = duration / step;
  let currentStep = 0;

  progressTimer = setInterval(() => {
    currentStep++;
    progress.value = (currentStep / totalSteps) * 100;
  }, step);

  timer = setInterval(() => {
    if (props.news.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % props.news.length;
      // Reset progress logic
      currentStep = 0;
      progress.value = 0;
    }
  }, duration);
};

watch(() => props.news, (newVal) => {
  if (newVal && newVal.length > 0) {
    currentIndex.value = 0;
    startRotation();
  }
});

onMounted(() => {
  if (props.news.length > 0) startRotation();
});

onUnmounted(() => {
  clearInterval(timer);
  clearInterval(progressTimer);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
