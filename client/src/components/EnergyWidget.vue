<template>
  <div class="h-full flex flex-col" v-if="energy">
    <!-- Current Price Header -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <div class="text-sm text-slate-400 uppercase tracking-widest">Electricity Price</div>
        <div :class="['text-7xl font-bold truncate', priceColorClass]">
          {{ energy.state }} <span class="text-2xl text-slate-500">c/kWh</span>
        </div>
      </div>
      <!-- Status Badge -->
      <div :class="['px-4 py-2 rounded-full text-sm font-bold uppercase', statusBadgeClass]">
        {{ priceStatus }}
      </div>
    </div>

    <!-- Chart Container -->
    <div class="flex-grow w-full relative min-h-0">
      <canvas ref="chartCanvas" class="w-full h-full"></canvas>
    </div>
  </div>
  <div v-else class="h-full flex items-center justify-center text-slate-500">
    Loading Energy Data...
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  energy: Object
});

const chartCanvas = ref(null);
let chartInstance = null;

const priceStatus = computed(() => {
  const price = parseFloat(props.energy?.state || 0);
  if (price < 10) return 'Low';
  if (price < 20) return 'Medium';
  return 'High';
});

const priceColorClass = computed(() => {
  const price = parseFloat(props.energy?.state || 0);
  if (price < 10) return 'text-green-400';
  if (price < 20) return 'text-yellow-400';
  return 'text-red-400';
});

const statusBadgeClass = computed(() => {
  const price = parseFloat(props.energy?.state || 0);
  if (price < 10) return 'bg-green-500/20 text-green-400';
  if (price < 20) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-red-500/20 text-red-400';
});

// Prepare Data for Chart
const processChartData = () => {
  if (!props.energy?.attributes?.raw_today) return { labels: [], data: [], colors: [] };

  const rawData = props.energy.attributes.raw_today;
  // Sort by time just in case
  rawData.sort((a, b) => new Date(a.start) - new Date(b.start));

  const labels = rawData.map(d => {
    const date = new Date(d.start);
    return date.getHours().toString().padStart(2, '0');
  });

  const data = rawData.map(d => d.value);

  // Dynamic point colors based on value
  const colors = data.map(val => {
    if (val < 10) return 'rgba(74, 222, 128, 1)'; // green-400
    if (val < 20) return 'rgba(250, 204, 21, 1)'; // yellow-400
    return 'rgba(248, 113, 113, 1)'; // red-400
  });

  return { labels, data, colors };
};

const renderChart = () => {
  if (!chartCanvas.value || !props.energy) return;
  
  if (chartInstance) {
    chartInstance.destroy();
  }

  const { labels, data, colors } = processChartData();
  const ctx = chartCanvas.value.getContext('2d');

  // Gradient Fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(148, 163, 184, 0.2)');
  gradient.addColorStop(1, 'rgba(148, 163, 184, 0)');

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Price (c/kWh)',
        data: data,
        borderColor: '#94a3b8', // slate-400
        borderWidth: 2,
        backgroundColor: gradient,
        fill: true,
        pointBackgroundColor: colors, // data driven colors not natively supported on points easily in line chart without plugin or processing, 
        // actually pointBackgroundColor can be an array.
        pointBorderColor: '#1e293b', // slate-800
        pointRadius: 4,
        pointHoverRadius: 6,
        stepped: true, 
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1e293b',
          titleColor: '#e2e8f0',
          bodyColor: '#e2e8f0',
          borderColor: '#475569',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { color: '#64748b' } // slate-500
        },
        y: {
          grid: { color: '#334155', drawBorder: false }, // slate-700
          ticks: { color: '#64748b' },
          beginAtZero: true
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
    }
  });
};

watch(() => props.energy, async () => {
  await nextTick();
  renderChart();
});

onMounted(() => {
  renderChart();
});

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy();
});
</script>
