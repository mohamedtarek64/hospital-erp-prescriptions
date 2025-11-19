/**
 * Inventory Helper Functions
 * دوال مساعدة لإدارة المخزون
 */

import { formatDate, formatPrice } from './pharmacyHelpers'

/**
 * Calculate days until expiry
 * حساب الأيام المتبقية حتى انتهاء الصلاحية
 */
export const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null
  
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Get expiry status class
 * الحصول على فئة حالة انتهاء الصلاحية
 */
export const getExpiryStatusClass = (expiryDate) => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
  
  if (daysUntilExpiry === null) return 'expiry-unknown'
  if (daysUntilExpiry < 0) return 'expiry-expired'
  if (daysUntilExpiry <= 7) return 'expiry-critical'
  if (daysUntilExpiry <= 30) return 'expiry-warning'
  return 'expiry-normal'
}

/**
 * Get expiry status text
 * الحصول على نص حالة انتهاء الصلاحية
 */
export const getExpiryStatusText = (expiryDate) => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
  
  if (daysUntilExpiry === null) return 'غير محدد'
  if (daysUntilExpiry < 0) return 'انتهت الصلاحية'
  if (daysUntilExpiry === 0) return 'ينتهي اليوم'
  if (daysUntilExpiry === 1) return 'ينتهي غداً'
  if (daysUntilExpiry <= 7) return `ينتهي خلال ${daysUntilExpiry} أيام`
  if (daysUntilExpiry <= 30) return `ينتهي خلال ${daysUntilExpiry} يوم`
  return `ينتهي خلال ${daysUntilExpiry} يوم`
}

/**
 * Get stock status class
 * الحصول على فئة حالة المخزون
 */
export const getStockStatusClass = (currentStock, minStock) => {
  if (currentStock === 0) return 'stock-out'
  if (currentStock <= minStock) return 'stock-low'
  if (currentStock <= minStock * 2) return 'stock-medium'
  return 'stock-good'
}

/**
 * Get stock status text
 * الحصول على نص حالة المخزون
 */
export const getStockStatusText = (currentStock, minStock) => {
  if (currentStock === 0) return 'نفذ'
  if (currentStock <= minStock) return 'منخفض'
  if (currentStock <= minStock * 2) return 'متوسط'
  return 'جيد'
}

/**
 * Calculate stock percentage
 * حساب نسبة المخزون
 */
export const getStockPercentage = (currentStock, maxStock) => {
  if (!maxStock || maxStock === 0) return 0
  return Math.round((currentStock / maxStock) * 100)
}

/**
 * Get stock level indicator
 * الحصول على مؤشر مستوى المخزون
 */
export const getStockLevelIndicator = (currentStock, minStock, maxStock) => {
  const percentage = getStockPercentage(currentStock, maxStock)
  
  if (currentStock === 0) return { level: 'empty', color: 'red', icon: '❌' }
  if (currentStock <= minStock) return { level: 'critical', color: 'orange', icon: '⚠️' }
  if (percentage <= 25) return { level: 'low', color: 'yellow', icon: '🟡' }
  if (percentage <= 50) return { level: 'medium', color: 'blue', icon: '🔵' }
  if (percentage <= 75) return { level: 'good', color: 'lightgreen', icon: '🟢' }
  return { level: 'excellent', color: 'green', icon: '✅' }
}

/**
 * Format stock quantity with unit
 * تنسيق كمية المخزون مع الوحدة
 */
export const formatStockQuantity = (quantity, unit = 'وحدة') => {
  if (quantity === 0) return `0 ${unit}`
  if (quantity === 1) return `1 ${unit}`
  if (quantity < 1000) return `${quantity} ${unit}`
  if (quantity < 1000000) return `${(quantity / 1000).toFixed(1)}K ${unit}`
  return `${(quantity / 1000000).toFixed(1)}M ${unit}`
}

/**
 * Calculate reorder quantity
 * حساب كمية إعادة الطلب
 */
export const calculateReorderQuantity = (currentStock, minStock, maxStock, averageUsage = 0) => {
  if (currentStock > minStock) return 0
  
  const safetyStock = minStock * 0.5
  const targetStock = maxStock * 0.8
  const neededStock = targetStock - currentStock + safetyStock
  
  // Consider average usage if available
  if (averageUsage > 0) {
    const usageBasedStock = averageUsage * 30 // 30 days
    return Math.max(neededStock, usageBasedStock)
  }
  
  return Math.max(neededStock, minStock)
}

/**
 * Check if reorder is needed
 * التحقق من الحاجة لإعادة الطلب
 */
export const isReorderNeeded = (currentStock, minStock, leadTime = 7, averageUsage = 0) => {
  if (currentStock > minStock) return false
  
  if (averageUsage > 0) {
    const stockoutRisk = currentStock - (averageUsage * leadTime)
    return stockoutRisk <= 0
  }
  
  return currentStock <= minStock
}

/**
 * Get reorder priority
 * الحصول على أولوية إعادة الطلب
 */
export const getReorderPriority = (currentStock, minStock, expiryDate) => {
  const daysUntilExpiry = getDaysUntilExpiry(expiryDate)
  const stockRatio = currentStock / minStock
  
  // High priority if stock is very low or expiring soon
  if (currentStock === 0 || stockRatio <= 0.5) return 'high'
  if (daysUntilExpiry <= 7) return 'high'
  
  // Medium priority if stock is low or expiring within 30 days
  if (stockRatio <= 1 || daysUntilExpiry <= 30) return 'medium'
  
  return 'low'
}

/**
 * Calculate inventory turnover rate
 * حساب معدل دوران المخزون
 */
export const calculateInventoryTurnover = (costOfGoodsSold, averageInventory) => {
  if (!averageInventory || averageInventory === 0) return 0
  return costOfGoodsSold / averageInventory
}

/**
 * Calculate days of inventory on hand
 * حساب أيام المخزون المتاح
 */
export const calculateDaysOfInventory = (averageInventory, costOfGoodsSold) => {
  if (!costOfGoodsSold || costOfGoodsSold === 0) return 0
  return (averageInventory / costOfGoodsSold) * 365
}

/**
 * Validate inventory data
 * التحقق من صحة بيانات المخزون
 */
export const validateInventoryData = (data) => {
  const errors = []
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('اسم الدواء مطلوب')
  }
  
  if (!data.category || data.category.trim().length === 0) {
    errors.push('فئة الدواء مطلوبة')
  }
  
  if (data.currentStock === undefined || data.currentStock < 0) {
    errors.push('المخزون الحالي يجب أن يكون رقم موجب')
  }
  
  if (data.minStock === undefined || data.minStock < 0) {
    errors.push('المخزون الأدنى يجب أن يكون رقم موجب')
  }
  
  if (data.purchasePrice === undefined || data.purchasePrice < 0) {
    errors.push('سعر الشراء يجب أن يكون رقم موجب')
  }
  
  if (data.sellingPrice === undefined || data.sellingPrice < 0) {
    errors.push('سعر البيع يجب أن يكون رقم موجب')
  }
  
  if (data.expiryDate && new Date(data.expiryDate) < new Date()) {
    errors.push('تاريخ انتهاء الصلاحية لا يمكن أن يكون في الماضي')
  }
  
  if (data.sellingPrice < data.purchasePrice) {
    errors.push('سعر البيع يجب أن يكون أكبر من سعر الشراء')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate barcode
 * توليد باركود
 */
export const generateBarcode = (prefix = 'MED', length = 8) => {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, length - timestamp.length + 2)
  return `${prefix}${timestamp}${random}`.substring(0, length).toUpperCase()
}

/**
 * Format inventory item for display
 * تنسيق عنصر المخزون للعرض
 */
export const formatInventoryItem = (item) => {
  return {
    ...item,
    formattedCurrentStock: formatStockQuantity(item.currentStock),
    formattedMinStock: formatStockQuantity(item.minStock),
    formattedPurchasePrice: formatPrice(item.purchasePrice),
    formattedSellingPrice: formatPrice(item.sellingPrice),
    formattedExpiryDate: formatDate(item.expiryDate),
    expiryStatus: getExpiryStatusClass(item.expiryDate),
    expiryText: getExpiryStatusText(item.expiryDate),
    stockStatus: getStockStatusClass(item.currentStock, item.minStock),
    stockText: getStockStatusText(item.currentStock, item.minStock),
    stockLevel: getStockLevelIndicator(item.currentStock, item.minStock, item.maxStock || item.minStock * 3),
    reorderNeeded: isReorderNeeded(item.currentStock, item.minStock),
    reorderPriority: getReorderPriority(item.currentStock, item.minStock, item.expiryDate),
    reorderQuantity: calculateReorderQuantity(item.currentStock, item.minStock, item.maxStock || item.minStock * 3)
  }
}

/**
 * Sort inventory items
 * ترتيب عناصر المخزون
 */
export const sortInventoryItems = (items, sortBy = 'name', sortOrder = 'asc') => {
  const sortedItems = [...items]
  
  sortedItems.sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || ''
        bValue = b.name?.toLowerCase() || ''
        break
      case 'category':
        aValue = a.category?.toLowerCase() || ''
        bValue = b.category?.toLowerCase() || ''
        break
      case 'currentStock':
        aValue = a.currentStock || 0
        bValue = b.currentStock || 0
        break
      case 'expiryDate':
        aValue = new Date(a.expiryDate || '9999-12-31')
        bValue = new Date(b.expiryDate || '9999-12-31')
        break
      case 'purchasePrice':
        aValue = a.purchasePrice || 0
        bValue = b.purchasePrice || 0
        break
      case 'supplier':
        aValue = a.supplier?.name?.toLowerCase() || ''
        bValue = b.supplier?.name?.toLowerCase() || ''
        break
      default:
        aValue = a[sortBy] || ''
        bValue = b[sortBy] || ''
    }
    
    if (sortOrder === 'desc') {
      [aValue, bValue] = [bValue, aValue]
    }
    
    if (aValue < bValue) return -1
    if (aValue > bValue) return 1
    return 0
  })
  
  return sortedItems
}

/**
 * Filter inventory items
 * تصفية عناصر المخزون
 */
export const filterInventoryItems = (items, filters = {}) => {
  return items.filter(item => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const searchableFields = [
        item.name,
        item.category,
        item.supplier?.name,
        item.barcode,
        item.genericName
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (!searchableFields.includes(searchTerm)) return false
    }
    
    // Category filter
    if (filters.category && item.category !== filters.category) return false
    
    // Supplier filter
    if (filters.supplier && item.supplier?.id !== filters.supplier) return false
    
    // Stock status filter
    if (filters.stockStatus) {
      const stockStatus = getStockStatusClass(item.currentStock, item.minStock)
      if (stockStatus !== filters.stockStatus) return false
    }
    
    // Expiry status filter
    if (filters.expiryStatus) {
      const expiryStatus = getExpiryStatusClass(item.expiryDate)
      if (expiryStatus !== filters.expiryStatus) return false
    }
    
    // Price range filter
    if (filters.minPrice && item.purchasePrice < filters.minPrice) return false
    if (filters.maxPrice && item.purchasePrice > filters.maxPrice) return false
    
    // Stock range filter
    if (filters.minStock && item.currentStock < filters.minStock) return false
    if (filters.maxStock && item.currentStock > filters.maxStock) return false
    
    return true
  })
}

/**
 * Calculate inventory statistics
 * حساب إحصائيات المخزون
 */
export const calculateInventoryStats = (items) => {
  if (!items || items.length === 0) {
    return {
      totalItems: 0,
      totalValue: 0,
      totalRetailValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      expiredItems: 0,
      expiringSoonItems: 0,
      averageStockLevel: 0,
      averagePrice: 0
    }
  }
  
  const stats = items.reduce((acc, item) => {
    acc.totalItems++
    acc.totalValue += (item.currentStock * (item.purchasePrice || 0))
    acc.totalRetailValue += (item.currentStock * (item.sellingPrice || 0))
    
    if (item.currentStock === 0) acc.outOfStockItems++
    else if (item.currentStock <= (item.minStock || 0)) acc.lowStockItems++
    
    if (item.expiryDate) {
      const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)
      if (daysUntilExpiry < 0) acc.expiredItems++
      else if (daysUntilExpiry <= 30) acc.expiringSoonItems++
    }
    
    acc.totalStock += item.currentStock
    acc.totalPrice += (item.purchasePrice || 0)
    
    return acc
  }, {
    totalItems: 0,
    totalValue: 0,
    totalRetailValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiredItems: 0,
    expiringSoonItems: 0,
    totalStock: 0,
    totalPrice: 0
  })
  
  stats.averageStockLevel = stats.totalItems > 0 ? stats.totalStock / stats.totalItems : 0
  stats.averagePrice = stats.totalItems > 0 ? stats.totalPrice / stats.totalItems : 0
  
  return stats
}

export default {
  getDaysUntilExpiry,
  getExpiryStatusClass,
  getExpiryStatusText,
  getStockStatusClass,
  getStockStatusText,
  getStockPercentage,
  getStockLevelIndicator,
  formatStockQuantity,
  calculateReorderQuantity,
  isReorderNeeded,
  getReorderPriority,
  calculateInventoryTurnover,
  calculateDaysOfInventory,
  validateInventoryData,
  generateBarcode,
  formatInventoryItem,
  sortInventoryItems,
  filterInventoryItems,
  calculateInventoryStats
}
