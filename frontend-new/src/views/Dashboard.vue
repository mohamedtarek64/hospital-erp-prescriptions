<template>
  <div class="flex h-screen w-full bg-white overflow-hidden">
    <!-- Sidebar -->
    <Sidebar :user="user" />
    
    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header class="h-[80px] bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div class="flex items-center gap-4">
          <button class="lg:hidden p-2 -ml-2" @click="toggleMobileMenu">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <button class="hidden lg:block p-2" @click="toggleSidebar">
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="relative hidden sm:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">search</span>
            <input 
              v-model="searchQuery"
              class="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-100 border-transparent focus:ring-2 focus:ring-blue-500 focus:bg-white transition" 
              placeholder="البحث..." 
              type="text"
            />
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button class="relative p-2 rounded-full hover:bg-gray-100" @click="toggleNotifications">
            <span class="material-symbols-outlined text-gray-600">notifications</span>
            <span v-if="notificationCount > 0" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div class="flex items-center gap-3">
            <img 
              :src="user?.avatar || '/default-avatar.jpg'" 
              :alt="user?.name || 'المستخدم'"
              class="size-10 rounded-full object-cover"
            />
            <div class="hidden md:block">
              <p class="font-semibold text-sm">{{ user?.name || 'المستخدم' }}</p>
              <p class="text-xs text-gray-500">{{ getRoleName(user?.role) }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6 lg:p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Welcome Section -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">مرحباً بعودتك، {{ user?.name || 'المستخدم' }}!</h1>
            <p class="text-gray-500 mt-1">إليك ما يحدث في مستشفاك اليوم.</p>
          </div>

          <!-- Statistics Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-600">المرضى</h3>
                <div class="p-2 bg-blue-100 rounded-full text-blue-500">
                  <span class="material-symbols-outlined">group</span>
                </div>
              </div>
              <div>
                <p class="text-4xl font-bold text-gray-800">{{ getDashboardStats().totalPatients || '2,345' }}</p>
                <p class="text-sm font-medium text-green-600 flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-base">arrow_upward</span>
                  +10%
                </p>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-600">المواعيد</h3>
                <div class="p-2 bg-purple-100 rounded-full text-purple-500">
                  <span class="material-symbols-outlined">calendar_today</span>
                </div>
              </div>
              <div>
                <p class="text-4xl font-bold text-gray-800">{{ getDashboardStats().todayAppointments || '1,234' }}</p>
                <p class="text-sm font-medium text-green-600 flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-base">arrow_upward</span>
                  +5%
                </p>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-600">الأطباء</h3>
                <div class="p-2 bg-green-100 rounded-full text-green-500">
                  <span class="material-symbols-outlined">medication</span>
                </div>
              </div>
              <div>
                <p class="text-4xl font-bold text-gray-800">{{ getDashboardStats().activeDoctors || '120' }}</p>
                <p class="text-sm font-medium text-green-600 flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-base">arrow_upward</span>
                  +2%
                </p>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between transform hover:-translate-y-1 transition-transform duration-300">
              <div class="flex justify-between items-start">
                <h3 class="text-lg font-medium text-gray-600">الإيرادات</h3>
                <div class="p-2 bg-yellow-100 rounded-full text-yellow-500">
                  <span class="material-symbols-outlined">paid</span>
                </div>
              </div>
              <div>
                <p class="text-4xl font-bold text-gray-800">{{ formatCurrency(getDashboardStats().monthlyRevenue) || '$50,000' }}</p>
                <p class="text-sm font-medium text-green-600 flex items-center gap-1 mt-1">
                  <span class="material-symbols-outlined text-base">arrow_upward</span>
                  +8%
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4">الإجراءات السريعة</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <router-link 
                to="/patients/new"
                class="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-500 hover:text-white transition-colors duration-300 group"
              >
                <span class="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white">person_add</span>
                <span class="text-sm font-semibold text-gray-700 group-hover:text-white">إضافة مريض</span>
              </router-link>
              <router-link 
                to="/appointments/new"
                class="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-500 hover:text-white transition-colors duration-300 group"
              >
                <span class="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white">book_online</span>
                <span class="text-sm font-semibold text-gray-700 group-hover:text-white">حجز موعد</span>
              </router-link>
              <router-link 
                to="/medical-records/new"
                class="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-500 hover:text-white transition-colors duration-300 group"
              >
                <span class="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white">medical_information</span>
                <span class="text-sm font-semibold text-gray-700 group-hover:text-white">السجلات الطبية</span>
              </router-link>
              <router-link 
                to="/pharmacy/prescriptions"
                class="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-500 hover:text-white transition-colors duration-300 group"
              >
                <span class="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white">prescription</span>
                <span class="text-sm font-semibold text-gray-700 group-hover:text-white">الوصفات الطبية</span>
              </router-link>
              <router-link 
                to="/lab/requests"
                class="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-500 hover:text-white transition-colors duration-300 group"
              >
                <span class="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white">science</span>
                <span class="text-sm font-semibold text-gray-700 group-hover:text-white">طلبات المختبر</span>
              </router-link>
              <router-link 
                to="/reports"
                class="flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-blue-500 hover:text-white transition-colors duration-300 group"
              >
                <span class="material-symbols-outlined text-3xl text-blue-500 group-hover:text-white">assessment</span>
                <span class="text-sm font-semibold text-gray-700 group-hover:text-white">التقارير</span>
              </router-link>
            </div>
          </div>

          <!-- Bottom Sections -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Today's Schedule -->
            <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 class="text-xl font-bold text-gray-800 mb-4">جدول اليوم</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-left">
                  <thead class="border-b-2 border-gray-100">
                    <tr>
                      <th class="p-3 text-sm font-semibold text-gray-500">الوقت</th>
                      <th class="p-3 text-sm font-semibold text-gray-500">المريض</th>
                      <th class="p-3 text-sm font-semibold text-gray-500 hidden md:table-cell">الطبيب</th>
                      <th class="p-3 text-sm font-semibold text-gray-500 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="appointment in getTodaysAppointments()" 
                      :key="appointment.id"
                      class="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td class="p-4 font-medium text-gray-600">{{ formatTime(appointment.time) || '9:00 ص' }}</td>
                      <td class="p-4 font-semibold text-gray-800">{{ appointment.patient_name || 'فاطمة حسن' }}</td>
                      <td class="p-4 text-gray-600 hidden md:table-cell">د. {{ appointment.doctor_name || 'عمر' }}</td>
                      <td class="p-4 text-center">
                        <span :class="[
                          'px-3 py-1 text-xs font-semibold rounded-full',
                          appointment.status === 'confirmed' ? 'text-green-700 bg-green-100' :
                          appointment.status === 'pending' ? 'text-yellow-700 bg-yellow-100' :
                          appointment.status === 'completed' ? 'text-blue-700 bg-blue-100' :
                          'text-red-700 bg-red-100'
                        ]">
                          {{ getStatusText(appointment.status) || 'مؤكد' }}
                        </span>
                      </td>
                    </tr>
                    <!-- Default rows if no data -->
                    <tr v-if="!getTodaysAppointments() || getTodaysAppointments().length === 0" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="p-4 font-medium text-gray-600">9:00 ص</td>
                      <td class="p-4 font-semibold text-gray-800">فاطمة حسن</td>
                      <td class="p-4 text-gray-600 hidden md:table-cell">د. عمر</td>
                      <td class="p-4 text-center">
                        <span class="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">مؤكد</span>
                      </td>
                    </tr>
                    <tr v-if="!getTodaysAppointments() || getTodaysAppointments().length === 0" class="border-b border-gray-100 hover:bg-gray-50">
                      <td class="p-4 font-medium text-gray-600">10:00 ص</td>
                      <td class="p-4 font-semibold text-gray-800">علي محمود</td>
                      <td class="p-4 text-gray-600 hidden md:table-cell">د. ليلى</td>
                      <td class="p-4 text-center">
                        <span class="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">في الانتظار</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 class="text-xl font-bold text-gray-800 mb-6">النشاطات الأخيرة</h2>
              <div class="relative">
                <div class="absolute left-3.5 h-full w-0.5 bg-gray-200"></div>
                <div class="space-y-8">
                  <div 
                    v-for="activity in getRecentActivities()" 
                    :key="activity.id"
                    class="relative flex items-start"
                  >
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-4 z-10">
                      <span class="material-symbols-outlined text-base">{{ getActivityIcon(activity.type) || 'person_add' }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">{{ activity.description || 'تم إضافة مريض جديد' }}</p>
                      <p class="text-sm text-gray-500">{{ activity.details || 'فاطمة حسن تم إضافتها.' }}</p>
                      <p class="text-xs text-gray-400 mt-1">{{ formatTimeAgo(activity.created_at) || '10 دقائق مضت' }}</p>
                    </div>
                  </div>
                  <!-- Default activities if no data -->
                  <div v-if="!getRecentActivities() || getRecentActivities().length === 0" class="relative flex items-start">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-4 z-10">
                      <span class="material-symbols-outlined text-base">person_add</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">تم إضافة مريض جديد</p>
                      <p class="text-sm text-gray-500">فاطمة حسن تم إضافتها.</p>
                      <p class="text-xs text-gray-400 mt-1">10 دقائق مضت</p>
                    </div>
                  </div>
                  <div v-if="!getRecentActivities() || getRecentActivities().length === 0" class="relative flex items-start">
                    <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white mr-4 z-10">
                      <span class="material-symbols-outlined text-base">calendar_month</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800">تم حجز موعد</p>
                      <p class="text-sm text-gray-500">علي محمود مع د. ليلى.</p>
                      <p class="text-xs text-gray-400 mt-1">ساعة مضت</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'DashboardView'
})
import { onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { formatCurrency, formatTime, formatTimeAgo } from '@/utils/dashboardHelpers'
import DashboardManager from '@/scripts/dashboard/dashboardManager.js'
import Sidebar from '@/components/dashboard/Sidebar.vue'

// Get router
const router = useRouter()

// Components
const components = {
  RouterLink
}

// Initialize dashboard manager
const dashboardManager = new DashboardManager(router)

// Get reactive data and methods
const { user } = dashboardManager.getReactiveData()

const {
  getRoleName,
  getUserDepartmentInfo,
  getDashboardStats,
  navigateTo,
  getTodaysAppointments,
  getRecentActivities,
  getStatusText,
  getActivityIcon
} = dashboardManager.getMethods()

// New reactive variables for the updated UI
const searchQuery = ref('')
const notificationCount = ref(3)
const isMobileMenuOpen = ref(false)

// Methods for header functionality
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleSidebar = () => {
  // This will be handled by the Sidebar component
  // We can emit an event or use a store
  console.log('Toggle sidebar')
}

const toggleNotifications = () => {
  console.log('Toggle notifications')
}

// Lifecycle
onMounted(async () => {
  await dashboardManager.onMounted()
})
</script>

<style scoped>
@import '@/assets/css/dashboard-modern.css';
</style>
