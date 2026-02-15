import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePharmacyAnalytics() {
  // Get auth store
  const authStore = useAuthStore()

  // Reactive data
  const user = computed(() => authStore.user)

  // Analytics data
  const analyticsData = {
    totalMedicines: 1250,
    lowStockMedicines: 45,
    expiredMedicines: 12,
    totalSuppliers: 25,
    monthlyRevenue: 150000,
    prescriptionsToday: 89,
    averagePrescriptionValue: 450,
    topSellingMedicines: [
      { name: 'باراسيتامول', quantity: 150, revenue: 2250 },
      { name: 'أموكسيسيلين', quantity: 120, revenue: 3600 },
      { name: 'إيبوبروفين', quantity: 95, revenue: 1900 }
    ],
    revenueChart: {
      labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
      data: [120000, 135000, 142000, 138000, 155000, 150000]
    },
    prescriptionChart: {
      labels: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
      data: [45, 52, 48, 61, 55, 67, 43]
    }
  }

  // Methods
  const getRoleName = (role) => {
    const roles = {
      'admin': 'مدير',
      'doctor': 'طبيب',
      'nurse': 'ممرض/ممرضة',
      'receptionist': 'موظف استقبال'
    }
    return roles[role] || role
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount)
  }

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { status: 'نفد المخزون', class: 'text-red-600' }
    if (quantity <= minStock) return { status: 'مخزون منخفض', class: 'text-yellow-600' }
    return { status: 'متوفر', class: 'text-green-600' }
  }

  const exportAnalytics = () => {
    // Implementation for exporting analytics data
    console.log('Exporting analytics data...')
  }

  const refreshAnalytics = () => {
    // Implementation for refreshing analytics data
    console.log('Refreshing analytics data...')
  }

  return {
    user,
    analyticsData,
    getRoleName,
    formatCurrency,
    getStockStatus,
    exportAnalytics,
    refreshAnalytics
  }
}
