/**
 * Currency Helper Functions
 */

/**
 * Format currency amount with locale-specific formatting
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale code (default: en-US)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00'
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format currency amount without currency symbol
 * @param {number} amount - The amount to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted number string
 */
export const formatAmount = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00'
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount)
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0
  
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[$,]/g, '')
  const parsed = parseFloat(cleaned)
  
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Calculate tax amount
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate as percentage (e.g., 10 for 10%)
 * @returns {number} Tax amount
 */
export const calculateTax = (amount, taxRate) => {
  if (!amount || !taxRate) return 0
  return (amount * taxRate) / 100
}

/**
 * Calculate total amount including tax
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate as percentage
 * @returns {number} Total amount with tax
 */
export const calculateTotalWithTax = (amount, taxRate) => {
  if (!amount) return 0
  const tax = calculateTax(amount, taxRate)
  return amount + tax
}

/**
 * Calculate discount amount
 * @param {number} amount - Base amount
 * @param {number} discountRate - Discount rate as percentage
 * @returns {number} Discount amount
 */
export const calculateDiscount = (amount, discountRate) => {
  if (!amount || !discountRate) return 0
  return (amount * discountRate) / 100
}

/**
 * Calculate amount after discount
 * @param {number} amount - Base amount
 * @param {number} discountRate - Discount rate as percentage
 * @returns {number} Amount after discount
 */
export const calculateAmountAfterDiscount = (amount, discountRate) => {
  if (!amount) return 0
  const discount = calculateDiscount(amount, discountRate)
  return amount - discount
}

/**
 * Calculate final amount (after discount and tax)
 * @param {number} amount - Base amount
 * @param {number} discountRate - Discount rate as percentage
 * @param {number} taxRate - Tax rate as percentage
 * @returns {object} Object with breakdown
 */
export const calculateFinalAmount = (amount, discountRate = 0, taxRate = 0) => {
  if (!amount) {
    return {
      originalAmount: 0,
      discountAmount: 0,
      taxableAmount: 0,
      taxAmount: 0,
      finalAmount: 0
    }
  }

  const discountAmount = calculateDiscount(amount, discountRate)
  const taxableAmount = amount - discountAmount
  const taxAmount = calculateTax(taxableAmount, taxRate)
  const finalAmount = taxableAmount + taxAmount

  return {
    originalAmount: amount,
    discountAmount,
    taxableAmount,
    taxAmount,
    finalAmount
  }
}

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100)
}

/**
 * Convert currency between different rates
 * @param {number} amount - Amount to convert
 * @param {number} fromRate - Exchange rate from base currency
 * @param {number} toRate - Exchange rate to target currency
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromRate, toRate) => {
  if (!amount || !fromRate || !toRate) return 0
  return (amount / fromRate) * toRate
}

/**
 * Round currency amount to specified decimal places
 * @param {number} amount - Amount to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded amount
 */
export const roundCurrency = (amount, decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 0
  }
  
  return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

/**
 * Validate currency amount
 * @param {any} amount - Amount to validate
 * @returns {boolean} True if valid currency amount
 */
export const isValidCurrency = (amount) => {
  if (amount === null || amount === undefined) return false
  const num = parseFloat(amount)
  return !isNaN(num) && num >= 0 && isFinite(num)
}

/**
 * Get currency symbol for currency code
 * @param {string} currencyCode - Currency code (e.g., 'USD', 'EUR')
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode = 'USD') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: '$',
    KRW: '₩',
    RUB: '₽',
    ZAR: 'R',
    TRY: '₺',
    AED: 'د.إ',
    SAR: 'ر.س',
    EGP: '£',
    JOD: 'د.ا',
    KWD: 'د.ك',
    QAR: 'ر.ق',
    BHD: 'د.ب',
    OMR: 'ر.ع.'
  }
  
  return symbols[currencyCode.toUpperCase()] || currencyCode
}

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount with suffix
 */
export const formatLargeAmount = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0'
  }

  const absAmount = Math.abs(amount)
  const symbol = getCurrencySymbol(currency)
  
  if (absAmount >= 1000000000) {
    return `${symbol}${(amount / 1000000000).toFixed(1)}B`
  } else if (absAmount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`
  } else if (absAmount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`
  } else {
    return formatCurrency(amount, currency)
  }
}

/**
 * Calculate compound interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Interest rate as percentage
 * @param {number} time - Time period in years
 * @param {number} frequency - Compounding frequency per year (default: 12 for monthly)
 * @returns {number} Final amount
 */
export const calculateCompoundInterest = (principal, rate, time, frequency = 12) => {
  if (!principal || !rate || !time) return 0
  
  const r = rate / 100
  const n = frequency
  const t = time
  
  return principal * Math.pow(1 + (r / n), n * t)
}

/**
 * Calculate simple interest
 * @param {number} principal - Principal amount
 * @param {number} rate - Interest rate as percentage
 * @param {number} time - Time period in years
 * @returns {number} Interest amount
 */
export const calculateSimpleInterest = (principal, rate, time) => {
  if (!principal || !rate || !time) return 0
  return (principal * rate * time) / 100
}

/**
 * Calculate payment amount for loan
 * @param {number} principal - Principal amount
 * @param {number} rate - Interest rate as percentage per period
 * @param {number} periods - Number of payment periods
 * @returns {number} Payment amount per period
 */
export const calculateLoanPayment = (principal, rate, periods) => {
  if (!principal || !rate || !periods) return 0
  
  const r = rate / 100
  if (r === 0) return principal / periods
  
  return principal * (r * Math.pow(1 + r, periods)) / (Math.pow(1 + r, periods) - 1)
}

/**
 * Generate currency options for select dropdown
 * @returns {Array} Array of currency options
 */
export const getCurrencyOptions = () => {
  return [
    { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
    { value: 'EUR', label: 'Euro (€)', symbol: '€' },
    { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
    { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
    { value: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
    { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
    { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$' },
    { value: 'MXN', label: 'Mexican Peso ($)', symbol: '$' },
    { value: 'KRW', label: 'South Korean Won (₩)', symbol: '₩' },
    { value: 'RUB', label: 'Russian Ruble (₽)', symbol: '₽' },
    { value: 'ZAR', label: 'South African Rand (R)', symbol: 'R' },
    { value: 'TRY', label: 'Turkish Lira (₺)', symbol: '₺' },
    { value: 'AED', label: 'UAE Dirham (د.إ)', symbol: 'د.إ' },
    { value: 'SAR', label: 'Saudi Riyal (ر.س)', symbol: 'ر.س' },
    { value: 'EGP', label: 'Egyptian Pound (£)', symbol: '£' },
    { value: 'JOD', label: 'Jordanian Dinar (د.ا)', symbol: 'د.ا' },
    { value: 'KWD', label: 'Kuwaiti Dinar (د.ك)', symbol: 'د.ك' },
    { value: 'QAR', label: 'Qatari Riyal (ر.ق)', symbol: 'ر.ق' },
    { value: 'BHD', label: 'Bahraini Dinar (د.ب)', symbol: 'د.ب' },
    { value: 'OMR', label: 'Omani Rial (ر.ع.)', symbol: 'ر.ع.' }
  ]
}
