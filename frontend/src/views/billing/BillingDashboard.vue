<template>
  <div class="billing-dashboard">
    <!-- Header -->
    <div class="billing-header">
      <div class="header-content">
        <h1 class="billing-title">Billing & Financial Management</h1>
        <p class="billing-subtitle">Manage invoices, payments, and financial reports</p>
      </div>
      <div class="header-actions">
        <button @click="createInvoice" class="btn-primary">
          <i class="fas fa-plus mr-2"></i>
          Create Invoice
        </button>
        <button @click="recordPayment" class="btn-secondary">
          <i class="fas fa-credit-card mr-2"></i>
          Record Payment
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon bg-blue-100">
          <i class="fas fa-file-invoice text-blue-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ formatCurrency(stats.current_month.total_amount) }}</h3>
          <p class="stat-label">Current Month Revenue</p>
          <p class="stat-change" :class="getChangeClass(stats.current_month.total_amount, stats.last_month.total_amount)">
            {{ getChangePercentage(stats.current_month.total_amount, stats.last_month.total_amount) }}
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-green-100">
          <i class="fas fa-check-circle text-green-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ formatCurrency(stats.current_month.paid_amount) }}</h3>
          <p class="stat-label">Paid Amount</p>
          <p class="stat-change" :class="getChangeClass(stats.current_month.paid_amount, stats.last_month.paid_amount)">
            {{ getChangePercentage(stats.current_month.paid_amount, stats.last_month.paid_amount) }}
          </p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-orange-100">
          <i class="fas fa-clock text-orange-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ formatCurrency(stats.overdue.amount) }}</h3>
          <p class="stat-label">Overdue Amount</p>
          <p class="stat-subtitle">{{ stats.overdue.count }} invoices</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon bg-purple-100">
          <i class="fas fa-chart-line text-purple-600"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stats.current_month.total_invoices }}</h3>
          <p class="stat-label">Total Invoices</p>
          <p class="stat-change" :class="getChangeClass(stats.current_month.total_invoices, stats.last_month.total_invoices)">
            {{ getChangePercentage(stats.current_month.total_invoices, stats.last_month.total_invoices) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <h3 class="chart-title">Revenue Trend</h3>
        <canvas ref="revenueChart" class="chart-canvas"></canvas>
      </div>
      
      <div class="chart-container">
        <h3 class="chart-title">Payment Methods</h3>
        <canvas ref="paymentMethodsChart" class="chart-canvas"></canvas>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="recent-activity">
      <div class="activity-header">
        <h3 class="activity-title">Recent Activity</h3>
        <button @click="viewAllActivity" class="btn-outline">View All</button>
      </div>
      
      <div class="activity-list">
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="getActivityIconClass(activity.type)">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-content">
            <p class="activity-text">{{ activity.description }}</p>
            <p class="activity-time">{{ formatDate(activity.created_at) }}</p>
          </div>
          <div class="activity-amount" v-if="activity.amount">
            {{ formatCurrency(activity.amount) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h3 class="actions-title">Quick Actions</h3>
      <div class="actions-grid">
        <button @click="viewInvoices" class="action-card">
          <i class="fas fa-list"></i>
          <span>View Invoices</span>
        </button>
        <button @click="viewPayments" class="action-card">
          <i class="fas fa-credit-card"></i>
          <span>View Payments</span>
        </button>
        <button @click="viewReports" class="action-card">
          <i class="fas fa-chart-bar"></i>
          <span>Financial Reports</span>
        </button>
        <button @click="manageServices" class="action-card">
          <i class="fas fa-cogs"></i>
          <span>Manage Services</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { billingManager } from '@/scripts/billing/billingManager'

export default {
  name: 'BillingDashboard',
  setup() {
    const router = useRouter()
    const revenueChart = ref(null)
    const paymentMethodsChart = ref(null)
    
    const stats = reactive({
      current_month: {
        total_invoices: 0,
        total_amount: 0,
        paid_amount: 0,
        outstanding_amount: 0
      },
      last_month: {
        total_invoices: 0,
        total_amount: 0,
        paid_amount: 0
      },
      overdue: {
        count: 0,
        amount: 0
      },
      pending: {
        count: 0,
        amount: 0
      }
    })

    const recentActivity = ref([])
    const manager = new billingManager()

    const loadDashboardData = async () => {
      try {
        const dashboardData = await manager.getDashboardStats()
        Object.assign(stats, dashboardData)
        
        const activityData = await manager.getRecentActivity()
        recentActivity.value = activityData
        
        initializeCharts(dashboardData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    const initializeCharts = (data) => {
      // Revenue Trend Chart
      if (revenueChart.value) {
        new Chart(revenueChart.value, {
          type: 'line',
          data: {
            labels: data.monthly_trend.map(item => item.month),
            datasets: [{
              label: 'Revenue',
              data: data.monthly_trend.map(item => item.amount),
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString()
                  }
                }
              }
            }
          }
        })
      }

      // Payment Methods Chart
      if (paymentMethodsChart.value) {
        new Chart(paymentMethodsChart.value, {
          type: 'doughnut',
          data: {
            labels: data.payment_methods.map(item => item.payment_method),
            datasets: [{
              data: data.payment_methods.map(item => item.total),
              backgroundColor: [
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#EF4444',
                '#8B5CF6'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        })
      }
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const getChangeClass = (current, previous) => {
      const change = ((current - previous) / previous) * 100
      return change >= 0 ? 'text-green-600' : 'text-red-600'
    }

    const getChangePercentage = (current, previous) => {
      if (previous === 0) return '0%'
      const change = ((current - previous) / previous) * 100
      return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
    }

    const getActivityIcon = (type) => {
      const icons = {
        'invoice_created': 'fas fa-file-invoice',
        'payment_received': 'fas fa-credit-card',
        'invoice_paid': 'fas fa-check-circle',
        'invoice_overdue': 'fas fa-exclamation-triangle'
      }
      return icons[type] || 'fas fa-info-circle'
    }

    const getActivityIconClass = (type) => {
      const classes = {
        'invoice_created': 'bg-blue-100 text-blue-600',
        'payment_received': 'bg-green-100 text-green-600',
        'invoice_paid': 'bg-green-100 text-green-600',
        'invoice_overdue': 'bg-red-100 text-red-600'
      }
      return classes[type] || 'bg-gray-100 text-gray-600'
    }

    const createInvoice = () => {
      router.push('/billing/invoices/create')
    }

    const recordPayment = () => {
      router.push('/billing/payments/create')
    }

    const viewInvoices = () => {
      router.push('/billing/invoices')
    }

    const viewPayments = () => {
      router.push('/billing/payments')
    }

    const viewReports = () => {
      router.push('/billing/reports')
    }

    const manageServices = () => {
      router.push('/billing/services')
    }

    const viewAllActivity = () => {
      router.push('/billing/activity')
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      stats,
      recentActivity,
      revenueChart,
      paymentMethodsChart,
      formatCurrency,
      formatDate,
      getChangeClass,
      getChangePercentage,
      getActivityIcon,
      getActivityIconClass,
      createInvoice,
      recordPayment,
      viewInvoices,
      viewPayments,
      viewReports,
      manageServices,
      viewAllActivity
    }
  }
}
</script>

<style scoped>
@import '@/assets/css/billing.css';
</style>
