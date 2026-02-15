export const getMenuIcon = (menuId) => {
  const iconMap = {
    'dashboard': 'fas fa-tachometer-alt',
    'patients': 'fas fa-users',
    'appointments': 'fas fa-calendar-alt',
    'medical-records': 'fas fa-file-medical',
    'pharmacy': 'fas fa-pills',
    'billing': 'fas fa-receipt',
    'laboratory': 'fas fa-flask',
    'hr': 'fas fa-user-tie',
    'reports': 'fas fa-chart-bar',
    'ward-management': 'fas fa-bed',
    'emergency': 'fas fa-ambulance',
    'equipment': 'fas fa-tools',
    'admin': 'fas fa-cog'
  }
  
  return iconMap[menuId] || 'fas fa-circle'
}

export const getMenuColor = (menuId) => {
  const colorMap = {
    'dashboard': 'text-blue-600',
    'patients': 'text-green-600',
    'appointments': 'text-purple-600',
    'medical-records': 'text-indigo-600',
    'pharmacy': 'text-pink-600',
    'billing': 'text-yellow-600',
    'laboratory': 'text-red-600',
    'hr': 'text-gray-600',
    'reports': 'text-orange-600',
    'ward-management': 'text-teal-600',
    'emergency': 'text-red-600',
    'equipment': 'text-gray-600',
    'admin': 'text-gray-600'
  }
  
  return colorMap[menuId] || 'text-gray-600'
}

export const isMenuActive = (menuId, currentRoute) => {
  if (!currentRoute) return false
  
  const routeMap = {
    'dashboard': '/dashboard',
    'patients': '/patients',
    'appointments': '/appointments',
    'medical-records': '/medical-records',
    'pharmacy': '/pharmacy',
    'billing': '/billing',
    'laboratory': '/laboratory',
    'hr': '/hr',
    'reports': '/reports',
    'ward-management': '/ward-management',
    'emergency': '/emergency',
    'equipment': '/equipment',
    'admin': '/admin'
  }
  
  const menuRoute = routeMap[menuId]
  if (!menuRoute) return false
  
  return currentRoute.startsWith(menuRoute)
}

export const getPageTitle = (route) => {
  const titleMap = {
    '/dashboard': 'Dashboard',
    '/patients': 'Patients',
    '/appointments': 'Appointments',
    '/medical-records': 'Medical Records',
    '/pharmacy': 'Pharmacy',
    '/billing': 'Billing',
    '/laboratory': 'Laboratory',
    '/hr': 'Human Resources',
    '/reports': 'Reports',
    '/ward-management': 'Ward Management',
    '/emergency': 'Emergency',
    '/equipment': 'Equipment',
    '/admin': 'Administration'
  }
  
  return titleMap[route] || 'Hospital Management System'
}

export default {
  getMenuIcon,
  getMenuColor,
  isMenuActive,
  getPageTitle
}