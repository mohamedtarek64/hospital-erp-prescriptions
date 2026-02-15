<template>
  <div class="sidebar-container">
    <!-- Mobile Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      @click="closeMobileMenu"
      class="sidebar-overlay"
      role="button"
      tabindex="0"
      :aria-label="'إغلاق القائمة'"
      @keydown.enter="closeMobileMenu"
      @keydown.space="closeMobileMenu"
    ></div>

    <!-- Sidebar -->
    <aside 
      :class="[
        'sidebar',
        { 'sidebar-open': isMobileMenuOpen },
        { 'sidebar-collapsed': isCollapsed && !isMobile }
      ]"
      role="navigation"
      :aria-label="'القائمة الجانبية'"
      :aria-expanded="isMobileMenuOpen"
    >
      <!-- Sidebar Header -->
      <header class="sidebar-header">
        <div class="sidebar-logo">
          <div class="sidebar-logo-container">
            <svg 
              class="sidebar-logo-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              role="img"
              :aria-label="'شعار مستشفى كليوباترا'"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <div class="sidebar-logo-badge">
              <span class="sidebar-logo-badge-text">HMS</span>
            </div>
          </div>
          <div 
            v-if="!isCollapsed || isMobile" 
            class="sidebar-logo-text-container"
            :aria-hidden="isCollapsed && !isMobile"
          >
            <span class="sidebar-logo-text">مستشفى كليوباترا</span>
            <span class="sidebar-logo-subtitle">نظام إدارة المستشفى</span>
          </div>
        </div>
        
        <!-- Notifications & Toggle -->
        <div class="sidebar-header-actions">
        <!-- Notifications -->
        <div v-if="!isCollapsed || isMobile" class="sidebar-notifications">
          <button 
            @click="toggleNotifications"
            class="sidebar-notification-btn"
            :title="'الإشعارات'"
          >
            <svg class="sidebar-notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z"></path>
            </svg>
            <span v-if="notificationCount > 0" class="sidebar-notification-badge">{{ notificationCount }}</span>
          </button>
          
          <!-- Notifications Dropdown -->
          <div v-if="isNotificationsOpen" class="sidebar-notifications-dropdown">
            <div class="sidebar-notifications-header">
              <h3>الإشعارات</h3>
              <button @click="markAllAsRead" class="sidebar-notifications-mark-all">تعيين الكل كمقروء</button>
            </div>
            <div class="sidebar-notifications-list">
              <div v-for="notification in notifications" :key="notification.id" class="sidebar-notification-item">
                <div class="sidebar-notification-icon-container">
                  <svg class="sidebar-notification-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="sidebar-notification-content">
                  <p class="sidebar-notification-title">{{ notification.title }}</p>
                  <p class="sidebar-notification-message">{{ notification.message }}</p>
                  <span class="sidebar-notification-time">{{ formatTimeAgo(notification.time) }}</span>
                </div>
                <button @click="markAsRead(notification.id)" class="sidebar-notification-mark-btn">×</button>
              </div>
            </div>
          </div>
        </div>

          <!-- Toggle Button -->
          <button 
            @click="toggleSidebar"
            class="sidebar-toggle-btn"
            :title="isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'"
            :aria-label="isCollapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'"
            :aria-expanded="!isCollapsed"
            type="button"
          >
            <svg 
              v-if="!isCollapsed" 
              class="sidebar-toggle-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
            </svg>
            <svg 
              v-else 
              class="sidebar-toggle-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              role="img"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- User Profile -->
      <section class="sidebar-user-profile" role="region" aria-label="معلومات المستخدم">
        <div class="sidebar-user-avatar-container">
          <div class="sidebar-user-avatar">
            <img 
              v-if="currentUser?.avatar" 
              :src="currentUser.avatar" 
              :alt="currentUser?.name || 'المستخدم'"
              class="sidebar-user-avatar-img"
              @error="handleAvatarError"
            >
            <svg 
              v-else
              class="sidebar-user-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              role="img"
              :aria-label="'صورة المستخدم'"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <div class="sidebar-user-status" :class="`sidebar-user-status-${userStatus}`"></div>
          </div>
          <button 
            v-if="!isCollapsed || isMobile"
            @click="toggleUserMenu"
            class="sidebar-user-menu-btn"
            :aria-label="'قائمة المستخدم'"
            :title="'قائمة المستخدم'"
          >
            <svg class="sidebar-user-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
            </svg>
          </button>
        </div>
        <div 
          v-if="!isCollapsed || isMobile" 
          class="sidebar-user-info"
          :aria-hidden="isCollapsed && !isMobile"
        >
          <div class="sidebar-user-name" :title="currentUser?.name || 'المستخدم'">
            {{ currentUser?.name || 'المستخدم' }}
          </div>
          <div class="sidebar-user-role" :title="getRoleName(currentUser?.role)">
            {{ getRoleName(currentUser?.role) }}
          </div>
          <div class="sidebar-user-last-seen">
            آخر نشاط: {{ formatLastSeen(currentUser?.last_seen) }}
          </div>
        </div>
      </section>

      <!-- Search Section -->
      <div v-if="!isCollapsed || isMobile" class="sidebar-search-section">
        <div class="sidebar-search-container">
          <div class="sidebar-search-input-wrapper">
            <svg class="sidebar-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              class="sidebar-search-input"
              placeholder="البحث في القائمة..."
              @input="handleSearch"
              @focus="showSearchResults = true"
              @blur="hideSearchResults"
              :aria-label="'البحث في القائمة'"
            >
            <button 
              v-if="searchQuery"
              @click="clearSearch"
              class="sidebar-search-clear"
              :aria-label="'مسح البحث'"
            >
              <svg class="sidebar-search-clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Search Results -->
          <div 
            v-if="showSearchResults && filteredSearchResults.length > 0" 
            class="sidebar-search-results"
            role="listbox"
            :aria-label="'نتائج البحث'"
          >
            <div 
              v-for="result in filteredSearchResults" 
              :key="result.id"
              class="sidebar-search-result-item"
              @click="navigateToSearchResult(result)"
              role="option"
              :aria-label="result.title"
            >
              <svg class="sidebar-search-result-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="result.icon"></path>
              </svg>
              <div class="sidebar-search-result-content">
                <span class="sidebar-search-result-title">{{ result.title }}</span>
                <span class="sidebar-search-result-subtitle">{{ result.subtitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav" role="navigation" aria-label="القائمة الرئيسية">
        <ul class="sidebar-menu" role="menubar">
          <!-- Dashboard -->
          <li class="sidebar-menu-item" role="none">
            <router-link 
              to="/dashboard" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path === '/dashboard' }"
              role="menuitem"
              :aria-current="$route.path === '/dashboard' ? 'page' : null"
              :title="'لوحة التحكم الرئيسية'"
            >
              <svg 
                class="sidebar-menu-icon" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                role="img"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
              </svg>
              <span 
                v-if="!isCollapsed || isMobile" 
                class="sidebar-menu-text"
                :aria-hidden="isCollapsed && !isMobile"
              >
                لوحة التحكم
              </span>
            </router-link>
          </li>

          <!-- Patients -->
          <li class="sidebar-menu-item">
            <router-link 
              to="/patients" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/patients') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">المرضى</span>
            </router-link>
          </li>

          <!-- Appointments -->
          <li class="sidebar-menu-item">
            <router-link 
              to="/appointments" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/appointments') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">المواعيد</span>
            </router-link>
          </li>

          <!-- Medical Records -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleMedicalRecords"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isMedicalRecordsOpen || $route.path.startsWith('/medical-records') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">السجلات الطبية</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isMedicalRecordsOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Medical Records Submenu -->
              <ul 
                v-if="isMedicalRecordsOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/medical-records" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>جميع السجلات</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/medical-records/create" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>إنشاء سجل جديد</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/medical-records/diagnoses" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <span>التشخيصات</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/medical-records/prescriptions" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    <span>الوصفات الطبية</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/medical-records/test-results" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>نتائج الفحوصات</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Pharmacy System -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="togglePharmacy"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isPharmacyOpen || $route.path.startsWith('/pharmacy') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">نظام الصيدلية</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isPharmacyOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Pharmacy Submenu -->
              <ul 
                v-if="isPharmacyOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    <span>الصفحة الرئيسية</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy/medicines" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    <span>إدارة الأدوية</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy/suppliers" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span>إدارة الموردين</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy/inventory" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>إدارة المخزون</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy/purchase-orders" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>طلبات الشراء</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy/prescriptions" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    <span>صرف الوصفات</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/pharmacy/analytics" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>التحليلات</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Billing & Finance -->
          <li class="sidebar-menu-item">
            <router-link 
              to="/billing" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/billing') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">الفواتير والمدفوعات</span>
            </router-link>
          </li>

          <!-- Laboratory -->
          <li class="sidebar-menu-item">
            <div 
              @click="toggleLaboratoryMenu"
              class="sidebar-menu-link sidebar-menu-link-toggle"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/laboratory') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">المختبر</span>
              <svg 
                v-if="!isCollapsed || isMobile" 
                class="sidebar-menu-arrow" 
                :class="{ 'sidebar-menu-arrow-rotated': isLaboratoryOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
            
            <!-- Laboratory Submenu -->
            <ul v-if="isLaboratoryOpen && (!isCollapsed || isMobile)" class="sidebar-submenu">
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/laboratory" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path === '/laboratory' }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">لوحة التحكم</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/laboratory/orders" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/laboratory/orders') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <span class="sidebar-submenu-text">طلبات المختبر</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/laboratory/tests" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/laboratory/tests') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">الفحوصات</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/laboratory/results" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/laboratory/results') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">النتائج</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/laboratory/specimens" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/laboratory/specimens') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">العينات</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Human Resources -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleHR"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isHROpen || $route.path.startsWith('/hr') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">الموارد البشرية</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isHROpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- HR Submenu -->
              <ul 
                v-if="isHROpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/hr" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>لوحة التحكم</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/employees" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>دليل الموظفين</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/attendance" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>إدارة الحضور</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/leave" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>إدارة الإجازات</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/payroll" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span>إدارة الرواتب</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/performance" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>تقييم الأداء</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/recruitment" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>التوظيف</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/hr/training" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    <span>التدريب والتطوير</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Ward Management -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleWardManagement"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isWardManagementOpen || $route.path.startsWith('/ward-management') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">إدارة الأجنحة</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isWardManagementOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Ward Management Submenu -->
              <ul 
                v-if="isWardManagementOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>لوحة التحكم</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/beds" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>تخصيص الأسرة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/admission" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>قبول المرضى</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/layout" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                    <span>تخطيط الأجنحة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/housekeeping" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                    </svg>
                    <span>إدارة النظافة</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Emergency -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleEmergency"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isEmergencyOpen || $route.path.startsWith('/emergency') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">الطوارئ</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isEmergencyOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Emergency Submenu -->
              <ul 
                v-if="isEmergencyOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/emergency" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span>لوحة الطوارئ</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/emergency/room" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>غرفة الطوارئ</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/emergency/ambulance" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>إرسال الإسعاف</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/emergency/triage" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>تقييم الأولوية</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/emergency/alerts" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z"></path>
                    </svg>
                    <span>التنبيهات الحرجة</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Equipment Management -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleEquipment"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isEquipmentOpen || $route.path.startsWith('/equipment') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">إدارة المعدات</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isEquipmentOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Equipment Submenu -->
              <ul 
                v-if="isEquipmentOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>لوحة التحكم</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/inventory" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>إدارة المخزون</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/tracking" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>تتبع الأصول</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/maintenance" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>جدولة الصيانة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/contracts" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>عقود الخدمة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/reports" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>تقارير الاستخدام</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Ward Management -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleWardManagement"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isWardManagementOpen || $route.path.startsWith('/ward-management') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">إدارة الأجنحة</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isWardManagementOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Ward Management Submenu -->
              <ul 
                v-if="isWardManagementOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>جميع الأجنحة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/beds" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                    <span>إدارة الأسرة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/admissions" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <span>قبول المرضى</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/discharges" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>خروج المرضى</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/ward-management/transfers" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                    <span>نقل المرضى</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Reports -->
          <li v-if="hasPermission('view_reports')" class="sidebar-menu-item">
            <button 
              @click="toggleReports"
              class="sidebar-menu-link sidebar-menu-link-button"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/reports') }"
              :aria-expanded="isReportsOpen"
              :aria-controls="'reports-submenu'"
              type="button"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">التقارير</span>
              <svg 
                v-if="!isCollapsed || isMobile"
                class="sidebar-menu-arrow" 
                :class="{ 'sidebar-menu-arrow-open': isReportsOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Reports Submenu -->
            <ul 
              v-if="isReportsOpen && (!isCollapsed || isMobile)"
              id="reports-submenu"
              class="sidebar-submenu"
              role="group"
              :aria-label="'قائمة التقارير الفرعية'"
            >
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path === '/reports' }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">لوحة تحكم التقارير</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/patients" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/patients') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">تقارير المرضى</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/financial" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/financial') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                  <span class="sidebar-submenu-text">التقارير المالية</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/laboratory" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/laboratory') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">تقارير المختبر</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/pharmacy" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/pharmacy') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">تقارير الصيدلية</span>
                </router-link>
              </li>
                <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/list" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/list') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  <span class="sidebar-submenu-text">قائمة التقارير</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/create" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/create') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span class="sidebar-submenu-text">إنشاء تقرير جديد</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/analytics" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/analytics') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">لوحة التحليلات</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/widgets" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/widgets') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">إدارة العناصر</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/reports/scheduler" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/reports/scheduler') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">جدولة التقارير</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Quality Assurance -->
          <li v-if="hasPermission('quality_assurance')" class="sidebar-menu-item">
            <button 
              @click="toggleQualityAssurance"
              class="sidebar-menu-link sidebar-menu-link-button"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/quality-assurance') }"
              :aria-expanded="isQualityAssuranceOpen"
              :aria-controls="'quality-assurance-submenu'"
              type="button"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">ضمان الجودة</span>
              <svg 
                v-if="!isCollapsed || isMobile"
                class="sidebar-menu-arrow" 
                :class="{ 'sidebar-menu-arrow-open': isQualityAssuranceOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            <!-- Quality Assurance Submenu -->
            <ul 
              v-if="isQualityAssuranceOpen && (!isCollapsed || isMobile)"
              id="quality-assurance-submenu"
              class="sidebar-submenu"
              role="group"
              :aria-label="'قائمة ضمان الجودة الفرعية'"
            >
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/quality-assurance" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path === '/quality-assurance' }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">لوحة التحكم</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/quality-assurance/standards" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/quality-assurance/standards') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">معايير الجودة</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/quality-assurance/audits" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/quality-assurance/audits') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                  <span class="sidebar-submenu-text">التدقيقات</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/quality-assurance/incidents" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/quality-assurance/incidents') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">إدارة الحوادث</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/quality-assurance/compliance" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/quality-assurance/compliance') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span class="sidebar-submenu-text">الامتثال</span>
                </router-link>
              </li>
              <li class="sidebar-submenu-item">
                <router-link 
                  to="/quality-assurance/training" 
                  class="sidebar-submenu-link"
                  :class="{ 'sidebar-submenu-link-active': $route.path.startsWith('/quality-assurance/training') }"
                >
                  <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  <span class="sidebar-submenu-text">التدريب</span>
                </router-link>
              </li>
            </ul>
          </li>

          <!-- Equipment Management -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleEquipment"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isEquipmentOpen || $route.path.startsWith('/equipment') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">إدارة المعدات</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isEquipmentOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Equipment Submenu -->
              <ul 
                v-if="isEquipmentOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>لوحة التحكم</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/inventory" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                    </svg>
                    <span>إدارة المخزون</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/tracking" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>تتبع الأصول</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/maintenance" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>جدولة الصيانة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/contracts" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <span>عقود الخدمة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/equipment/reports" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>تقارير الاستخدام</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Administration -->
          <li v-if="hasPermission('system_settings')" class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleAdmin"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isAdminOpen || $route.path.startsWith('/admin') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">الإدارة</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isAdminOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Admin Submenu -->
              <ul 
                v-if="isAdminOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/admin" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    </svg>
                    <span>لوحة الإدارة</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/admin/users" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                    <span>إدارة المستخدمين</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/admin/roles" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>إدارة الأدوار</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/admin/backup" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    <span>النسخ الاحتياطي</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/admin/logs" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span>سجلات النظام</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/admin/settings" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <span>إعدادات النظام</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Inventory Management -->
          <li class="sidebar-menu-item">
            <router-link 
              to="/inventory" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/inventory') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">إدارة المستودعات</span>
            </router-link>
          </li>

          <!-- Task Management -->
          <li class="sidebar-menu-item">
            <router-link 
              to="/tasks" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/tasks') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">إدارة المهام</span>
            </router-link>
          </li>

          <!-- Communication Center -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleCommunication"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isCommunicationOpen || $route.path.startsWith('/communication') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">مركز التواصل</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isCommunicationOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Communication Submenu -->
              <ul 
                v-if="isCommunicationOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/communication" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>لوحة التحكم</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/communication/messages" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span>الرسائل</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/communication/notifications" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z"></path>
                    </svg>
                    <span>الإشعارات</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/communication/announcements" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 00-1.564-.317z"></path>
                    </svg>
                    <span>الإعلانات</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/communication/feedback" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                    <span>التقييمات</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Analytics & Insights -->
          <li class="sidebar-menu-item">
            <div class="sidebar-menu-group">
              <button 
                @click="toggleAnalytics"
                class="sidebar-menu-link sidebar-menu-link-group"
                :class="{ 'sidebar-menu-link-active': isAnalyticsOpen || $route.path.startsWith('/analytics') }"
              >
                <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">التحليلات</span>
                <svg 
                  v-if="!isCollapsed || isMobile"
                  class="sidebar-menu-arrow"
                  :class="{ 'sidebar-menu-arrow-rotated': isAnalyticsOpen }"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Analytics Submenu -->
              <ul 
                v-if="isAnalyticsOpen && (!isCollapsed || isMobile)"
                class="sidebar-submenu"
              >
                <li class="sidebar-submenu-item">
                  <router-link to="/analytics" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <span>لوحة التحكم</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/analytics/performance" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    <span>أداء المستشفى</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/analytics/patient-flow" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>تدفق المرضى</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/analytics/financial" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <span>التحليل المالي</span>
                  </router-link>
                </li>
                <li class="sidebar-submenu-item">
                  <router-link to="/analytics/quality" class="sidebar-submenu-link">
                    <svg class="sidebar-submenu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>مؤشرات الجودة</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </li>

          <!-- Settings -->
          <li v-if="hasPermission('system_settings')" class="sidebar-menu-item">
            <router-link 
              to="/settings" 
              class="sidebar-menu-link"
              :class="{ 'sidebar-menu-link-active': $route.path.startsWith('/settings') }"
            >
              <svg class="sidebar-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span v-if="!isCollapsed || isMobile" class="sidebar-menu-text">الإعدادات</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Quick Actions -->
      <div v-if="!isCollapsed || isMobile" class="sidebar-quick-actions">
        <div class="sidebar-quick-actions-header">
          <h3 class="sidebar-quick-actions-title">إجراءات سريعة</h3>
        </div>
        <div class="sidebar-quick-actions-grid">
          <button 
            @click="quickAction('new-patient')"
            class="sidebar-quick-action-btn"
            :title="'إضافة مريض جديد'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span class="sidebar-quick-action-text">مريض جديد</span>
          </button>
          
          <button 
            @click="quickAction('new-appointment')"
            class="sidebar-quick-action-btn"
            :title="'حجز موعد جديد'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="sidebar-quick-action-text">موعد جديد</span>
          </button>
          
          <button 
            @click="quickAction('emergency')"
            class="sidebar-quick-action-btn sidebar-quick-action-emergency"
            :title="'حالة طوارئ'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="sidebar-quick-action-text">طوارئ</span>
          </button>
          
          <button 
            @click="quickAction('notifications')"
            class="sidebar-quick-action-btn"
            :title="'الإشعارات'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z"></path>
            </svg>
            <span class="sidebar-quick-action-text">إشعارات</span>
          </button>
          
          <button 
            @click="quickAction('new-prescription')"
            class="sidebar-quick-action-btn"
            :title="'وصفة طبية جديدة'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            <span class="sidebar-quick-action-text">وصفة طبية</span>
          </button>
          
          <button 
            @click="quickAction('lab-test')"
            class="sidebar-quick-action-btn"
            :title="'طلب فحص مخبري'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
            </svg>
            <span class="sidebar-quick-action-text">فحص مخبري</span>
          </button>
          
          <button 
            @click="quickAction('emergency-report')"
            class="sidebar-quick-action-btn"
            :title="'تقرير طوارئ'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span class="sidebar-quick-action-text">تقرير طوارئ</span>
          </button>
          
          <button 
            @click="quickAction('stock-alert')"
            class="sidebar-quick-action-btn"
            :title="'تنبيه المخزون'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <span class="sidebar-quick-action-text">تنبيه مخزون</span>
          </button>
          
          <button 
            @click="quickAction('new-task')"
            class="sidebar-quick-action-btn"
            :title="'مهمة جديدة'"
          >
            <svg class="sidebar-quick-action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            <span class="sidebar-quick-action-text">مهمة جديدة</span>
          </button>
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <button 
          @click="handleLogout"
          class="sidebar-logout-btn"
          :title="isCollapsed && !isMobile ? 'تسجيل الخروج' : ''"
        >
          <svg class="sidebar-logout-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span v-if="!isCollapsed || isMobile" class="sidebar-logout-text">تسجيل الخروج</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Menu Button -->
    <button 
      @click="openMobileMenu"
      class="mobile-menu-btn"
      v-if="isMobile"
    >
      <svg class="mobile-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineOptions({
  name: 'SidebarComponent'
})
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import SidebarManager from '@/scripts/dashboard/sidebarManager'
import { useSidebarEnhanced } from '@/scripts/dashboard/sidebarEnhanced'

/**
 * Component props
 */
const props = defineProps({
  user: {
    type: Object,
    default: null,
    validator: (value) => {
      // Validate user object structure
      if (!value) return true
      return typeof value === 'object' && 
             (value.name === undefined || typeof value.name === 'string') &&
             (value.role === undefined || typeof value.role === 'string')
    }
  }
})

// Get router instance
const router = useRouter()

// Initialize enhanced sidebar manager
const sidebarManager = new SidebarManager(router)

// Get reactive data and computed properties from main sidebar manager
const { 
  isCollapsed, 
  isMobileMenuOpen, 
  isMedicalRecordsOpen,
  isPharmacyOpen,
  isLaboratoryOpen,
  isReportsOpen,
  isWardManagementOpen,
  isEmergencyOpen,
  isEquipmentOpen,
  isAdminOpen,
  isCommunicationOpen,
  isAnalyticsOpen,
  isMobile,
  userInfo,
  sidebarWidth,
  mainContentMargin
} = sidebarManager.getReactiveData()

// Get all methods from main sidebar manager
const {
  toggleSidebar,
  openMobileMenu,
  closeMobileMenu,
  toggleMedicalRecords,
  togglePharmacy,
  toggleLaboratoryMenu,
  toggleReports,
  toggleWardManagement,
  toggleEmergency,
  toggleEquipment,
  toggleAdmin,
  toggleCommunication,
  toggleAnalytics,
  toggleNotifications,
  getRoleName,
  hasPermission,
  handleLogout,
  resetToDefaults,
  checkScreenSize
} = sidebarManager.getMethods()

// Get enhanced features from separated JavaScript
const {
  searchQuery,
  showSearchResults,
  userStatus,
  filteredSearchResults,
  handleSearch,
  clearSearch,
  hideSearchResults,
  navigateToSearchResult,
  toggleUserMenu,
  handleAvatarError,
  formatLastSeen,
  quickAction,
  setupEventListeners
} = useSidebarEnhanced(router)

// Computed properties for template (used in template)
const currentUser = computed(() => props.user || userInfo.value)

// Emit events to parent component
const emit = defineEmits(['sidebarToggle', 'mobileMenuToggle', 'submenuToggle', 'userLogout'])

// Setup event listeners for parent communication
onMounted(() => {
  sidebarManager.onMounted()
  
  // Setup enhanced event listeners
  const cleanupEnhancedListeners = setupEventListeners(emit)
  
  // Store cleanup function for later use
  window.sidebarEnhancedCleanup = cleanupEnhancedListeners
})

onUnmounted(() => {
  sidebarManager.onUnmounted()
  
  // Cleanup enhanced event listeners
  if (window.sidebarEnhancedCleanup) {
    window.sidebarEnhancedCleanup()
    delete window.sidebarEnhancedCleanup
  }
})

// Expose methods for parent component access
defineExpose({
  toggleSidebar,
  openMobileMenu,
  closeMobileMenu,
  resetToDefaults,
  checkScreenSize,
  sidebarWidth,
  mainContentMargin
})
</script>

<style scoped>
@import '@/assets/css/dashboard/sidebar-enhanced.css';
</style>
