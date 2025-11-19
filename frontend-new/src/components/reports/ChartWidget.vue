<template>
  <div class="chart-widget">
    <div class="widget-header">
      <h3 class="widget-title">{{ title }}</h3>
      <div class="widget-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="chart-filters" v-if="showFilters">
      <div class="filter-group">
        <select v-model="selectedPeriod" @change="onPeriodChange" class="filter-select">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
        
        <select v-model="selectedType" @change="onTypeChange" class="filter-select">
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="pie">Pie Chart</option>
          <option value="doughnut">Doughnut Chart</option>
        </select>
      </div>
    </div>

    <div class="chart-container">
      <div v-if="isLoading" class="chart-loading">
        <div class="loading-spinner">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="loading-text">Loading chart...</p>
        </div>
      </div>

      <div v-else-if="error" class="chart-error">
        <ExclamationTriangleIcon class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p class="error-text">{{ error }}</p>
        <button @click="refreshChart" class="btn-secondary mt-4">
          Try Again
        </button>
      </div>

      <div v-else class="chart-wrapper">
        <canvas :id="chartId" ref="chartCanvas"></canvas>
        <div v-if="!hasData" class="no-data-message">
          No data available for this chart.
        </div>
      </div>
    </div>

    <div v-if="showLegend && hasData" class="chart-legend">
      <div class="legend-items">
        <div
          v-for="(item, index) in legendItems"
          :key="index"
          class="legend-item"
        >
          <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
          <span class="legend-label">{{ item.label }}</span>
          <span class="legend-value">{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div v-if="showSummary && hasData" class="chart-summary">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Total</div>
          <div class="summary-value">{{ summaryData.total }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Average</div>
          <div class="summary-value">{{ summaryData.average }}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Growth</div>
          <div class="summary-value" :class="summaryData.growth >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ summaryData.growth >= 0 ? '+' : '' }}{{ summaryData.growth }}%
          </div>
        </div>
      </div>
    </div>

    <div v-if="description" class="widget-footer">
      <p class="widget-description">{{ description }}</p>
    </div>
  </div>
</template>

<script>
import { useChartWidget } from '@/composables/useChartWidget'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'ChartWidget',
  components: {
    ExclamationTriangleIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    data: {
      type: Object,
      default: () => ({})
    },
    type: {
      type: String,
      default: 'line',
      validator: (value) => ['line', 'bar', 'pie', 'doughnut', 'area'].includes(value)
    },
    showFilters: {
      type: Boolean,
      default: true
    },
    showLegend: {
      type: Boolean,
      default: true
    },
    showSummary: {
      type: Boolean,
      default: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['period-change', 'type-change', 'refresh'],
  setup(props, { emit }) {
    return useChartWidget(props, { emit })
  }
}
</script>