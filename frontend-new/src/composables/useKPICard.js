import { computed } from 'vue'
import { 
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from '@heroicons/vue/24/outline'

export function useKPICard(props, { emit }) {
  const iconComponent = computed(() => {
    const iconMap = {
      ChartBarIcon,
      UsersIcon,
      CurrencyDollarIcon,
      ClockIcon,
      HeartIcon,
      ShieldCheckIcon,
      DocumentTextIcon,
      TruckIcon,
      WrenchScrewdriverIcon
    }
    return iconMap[props.icon] || ChartBarIcon
  })

  const formattedValue = computed(() => {
    if (typeof props.value === 'number') {
      if (props.value >= 1000000) {
        return (props.value / 1000000).toFixed(1) + 'M'
      } else if (props.value >= 1000) {
        return (props.value / 1000).toFixed(1) + 'K'
      }
      return props.value.toLocaleString()
    }
    return props.value
  })

  const trendIcon = computed(() => {
    if (props.trend > 0) return ArrowUpIcon
    if (props.trend < 0) return ArrowDownIcon
    return MinusIcon
  })

  const trendText = computed(() => {
    const absTrend = Math.abs(props.trend)
    return `${absTrend.toFixed(1)}%`
  })

  const trendClasses = computed(() => {
    if (props.trend > 0) return 'trend-positive'
    if (props.trend < 0) return 'trend-negative'
    return 'trend-neutral'
  })

  const comparisonValue = computed(() => {
    if (props.comparison > 0) {
      return `+${props.comparison.toFixed(1)}%`
    } else if (props.comparison < 0) {
      return `${props.comparison.toFixed(1)}%`
    }
    return '0%'
  })

  const comparisonClasses = computed(() => {
    if (props.comparison > 0) return 'text-green-600'
    if (props.comparison < 0) return 'text-red-600'
    return 'text-gray-600'
  })

  const progressPercentage = computed(() => {
    return Math.min(Math.max(props.progress, 0), 100)
  })

  const progressClasses = computed(() => {
    if (props.progress >= 80) return 'bg-green-500'
    if (props.progress >= 60) return 'bg-blue-500'
    if (props.progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  })

  const valueClasses = computed(() => {
    const baseClasses = 'text-3xl font-bold'
    switch (props.variant) {
      case 'success':
        return `${baseClasses} text-green-600`
      case 'warning':
        return `${baseClasses} text-yellow-600`
      case 'danger':
        return `${baseClasses} text-red-600`
      case 'info':
        return `${baseClasses} text-blue-600`
      default:
        return `${baseClasses} text-gray-800`
    }
  })

  const cardClasses = computed(() => {
    const baseClasses = 'kpi-card-base'
    const sizeClasses = {
      small: 'kpi-card-small',
      medium: 'kpi-card-medium',
      large: 'kpi-card-large'
    }
    const variantClasses = {
      success: 'kpi-card-success',
      warning: 'kpi-card-warning',
      danger: 'kpi-card-danger',
      info: 'kpi-card-info'
    }
    
    return [
      baseClasses,
      sizeClasses[props.size],
      variantClasses[props.variant]
    ].filter(Boolean).join(' ')
  })

  const refreshKPI = () => {
    emit('refresh')
  }

  const showDetails = () => {
    emit('details')
  }

  const handleAction = () => {
    emit('action')
  }

  return {
    iconComponent,
    formattedValue,
    trendIcon,
    trendText,
    trendClasses,
    comparisonValue,
    comparisonClasses,
    progressPercentage,
    progressClasses,
    valueClasses,
    cardClasses,
    refreshKPI,
    showDetails,
    handleAction
  }
}
