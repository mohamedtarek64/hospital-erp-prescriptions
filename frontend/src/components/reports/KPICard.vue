<template>
  <div class="kpi-card" :class="cardClasses">
    <div class="kpi-header">
      <div class="kpi-icon">
        <component :is="iconComponent" class="h-6 w-6" />
      </div>
      <div class="kpi-title">
        <h3 class="title">{{ title }}</h3>
        <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
      </div>
      <div class="kpi-actions">
        <button @click="refreshKPI" class="btn-icon" :disabled="isLoading">
          <ArrowPathIcon class="h-4 w-4" :class="{ 'animate-spin': isLoading }" />
        </button>
        <button @click="showDetails" class="btn-icon">
          <InformationCircleIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="kpi-content">
      <div class="kpi-value">
        <span class="value" :class="valueClasses">{{ formattedValue }}</span>
        <span v-if="unit" class="unit">{{ unit }}</span>
      </div>

      <div v-if="showTrend" class="kpi-trend">
        <div class="trend-indicator" :class="trendClasses">
          <component :is="trendIcon" class="h-4 w-4" />
          <span class="trend-text">{{ trendText }}</span>
        </div>
        <div v-if="trendPeriod" class="trend-period">{{ trendPeriod }}</div>
      </div>

      <div v-if="showProgress" class="kpi-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
            :class="progressClasses"
          ></div>
        </div>
        <div class="progress-text">
          <span class="progress-label">{{ progressLabel }}</span>
          <span class="progress-value">{{ progressValue }}</span>
        </div>
      </div>

      <div v-if="showComparison" class="kpi-comparison">
        <div class="comparison-item">
          <span class="comparison-label">vs Previous</span>
          <span class="comparison-value" :class="comparisonClasses">
            {{ comparisonValue }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="showFooter" class="kpi-footer">
      <div class="footer-content">
        <span class="footer-text">{{ footerText }}</span>
        <button v-if="showAction" @click="handleAction" class="footer-action">
          {{ actionText }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="kpi-loading">
      <div class="loading-skeleton">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-value"></div>
        <div class="skeleton-line skeleton-trend"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="kpi-error">
      <ExclamationTriangleIcon class="h-8 w-8 text-red-500 mx-auto mb-2" />
      <p class="error-text">{{ error }}</p>
      <button @click="refreshKPI" class="btn-secondary btn-sm">
        Retry
      </button>
    </div>
  </div>
</template>

<script>
import { useKPICard } from '@/composables/useKPICard'
import { 
  ArrowPathIcon, 
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'

export default {
  name: 'KPICard',
  components: {
    ArrowPathIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    MinusIcon,
    ChartBarIcon,
    UsersIcon,
    CurrencyDollarIcon,
    ClockIcon,
    HeartIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    TruckIcon,
    WrenchScrewdriverIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    value: {
      type: [Number, String],
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    trend: {
      type: Number,
      default: 0
    },
    trendPeriod: {
      type: String,
      default: 'vs last period'
    },
    progress: {
      type: Number,
      default: 0
    },
    progressLabel: {
      type: String,
      default: 'Progress'
    },
    progressValue: {
      type: String,
      default: ''
    },
    comparison: {
      type: Number,
      default: 0
    },
    icon: {
      type: String,
      default: 'ChartBarIcon',
      validator: (value) => [
        'ChartBarIcon', 'UsersIcon', 'CurrencyDollarIcon', 'ClockIcon',
        'HeartIcon', 'ShieldCheckIcon', 'DocumentTextIcon', 'TruckIcon',
        'WrenchScrewdriverIcon'
      ].includes(value)
    },
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    showTrend: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    showComparison: {
      type: Boolean,
      default: false
    },
    showFooter: {
      type: Boolean,
      default: false
    },
    showAction: {
      type: Boolean,
      default: false
    },
    footerText: {
      type: String,
      default: ''
    },
    actionText: {
      type: String,
      default: 'View Details'
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
  emits: ['refresh', 'action', 'details'],
  setup(props, { emit }) {
    return useKPICard(props, { emit })
  }
}
</script>