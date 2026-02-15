/**
 * Form Validation Utility
 * Provides comprehensive validation functions
 */

export class Validator {
  /**
   * Validate required field
   */
  static required(value, fieldName = 'This field') {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`
    }
    return null
  }

  /**
   * Validate email format
   */
  static email(value) {
    if (!value) return null

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address'
    }
    return null
  }

  /**
   * Validate phone number
   */
  static phone(value) {
    if (!value) return null

    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid phone number'
    }
    return null
  }

  /**
   * Validate minimum length
   */
  static minLength(value, min, fieldName = 'This field') {
    if (!value) return null

    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`
    }
    return null
  }

  /**
   * Validate maximum length
   */
  static maxLength(value, max, fieldName = 'This field') {
    if (!value) return null

    if (value.length > max) {
      return `${fieldName} must not exceed ${max} characters`
    }
    return null
  }

  /**
   * Validate date format
   */
  static date(value) {
    if (!value) return null

    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date'
    }
    return null
  }

  /**
   * Validate date is in the past
   */
  static pastDate(value, fieldName = 'Date') {
    if (!value) return null

    const date = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date >= today) {
      return `${fieldName} must be in the past`
    }
    return null
  }

  /**
   * Validate date is in the future
   */
  static futureDate(value, fieldName = 'Date') {
    if (!value) return null

    const date = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date <= today) {
      return `${fieldName} must be in the future`
    }
    return null
  }

  /**
   * Validate numeric value
   */
  static numeric(value, fieldName = 'This field') {
    if (value === null || value === undefined || value === '') return null

    if (isNaN(value)) {
      return `${fieldName} must be a number`
    }
    return null
  }

  /**
   * Validate minimum value
   */
  static min(value, min, fieldName = 'This field') {
    if (value === null || value === undefined || value === '') return null

    if (Number(value) < min) {
      return `${fieldName} must be at least ${min}`
    }
    return null
  }

  /**
   * Validate maximum value
   */
  static max(value, max, fieldName = 'This field') {
    if (value === null || value === undefined || value === '') return null

    if (Number(value) > max) {
      return `${fieldName} must not exceed ${max}`
    }
    return null
  }

  /**
   * Validate URL format
   */
  static url(value) {
    if (!value) return null

    try {
      new URL(value)
      return null
    } catch (e) {
      return 'Please enter a valid URL'
    }
  }

  /**
   * Validate blood type
   */
  static bloodType(value) {
    if (!value) return null

    const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    if (!validBloodTypes.includes(value)) {
      return 'Please select a valid blood type'
    }
    return null
  }

  /**
   * Validate gender
   */
  static gender(value) {
    if (!value) return null

    const validGenders = ['male', 'female', 'other']
    if (!validGenders.includes(value)) {
      return 'Please select a valid gender'
    }
    return null
  }

  /**
   * Validate age
   */
  static age(value, min = 0, max = 150) {
    const numericError = this.numeric(value, 'Age')
    if (numericError) return numericError

    const age = Number(value)
    if (age < min || age > max) {
      return `Age must be between ${min} and ${max}`
    }
    return null
  }

  /**
   * Validate password strength
   */
  static password(value, minLength = 8) {
    if (!value) return null

    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters`
    }

    const hasUpperCase = /[A-Z]/.test(value)
    const hasLowerCase = /[a-z]/.test(value)
    const hasNumber = /\d/.test(value)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      return 'Password must contain uppercase, lowercase, number, and special character'
    }

    return null
  }

  /**
   * Validate password confirmation
   */
  static passwordConfirmation(password, confirmation) {
    if (!password || !confirmation) return null

    if (password !== confirmation) {
      return 'Passwords do not match'
    }
    return null
  }

  /**
   * Validate file size
   */
  static fileSize(file, maxSizeMB = 5) {
    if (!file) return null

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must not exceed ${maxSizeMB}MB`
    }
    return null
  }

  /**
   * Validate file type
   */
  static fileType(file, allowedTypes = []) {
    if (!file || allowedTypes.length === 0) return null

    const fileType = file.type
    if (!allowedTypes.includes(fileType)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`
    }
    return null
  }

  /**
   * Run multiple validations
   */
  static validate(value, rules = [], fieldName = 'This field') {
    for (const rule of rules) {
      let error = null

      if (typeof rule === 'function') {
        error = rule(value, fieldName)
      } else if (typeof rule === 'string') {
        switch (rule) {
          case 'required':
            error = this.required(value, fieldName)
            break
          case 'email':
            error = this.email(value)
            break
          case 'phone':
            error = this.phone(value)
            break
          case 'date':
            error = this.date(value)
            break
          case 'numeric':
            error = this.numeric(value, fieldName)
            break
          case 'url':
            error = this.url(value)
            break
          case 'bloodType':
            error = this.bloodType(value)
            break
          case 'gender':
            error = this.gender(value)
            break
          default:
            console.warn(`Unknown validation rule: ${rule}`)
        }
      } else if (typeof rule === 'object') {
        const { type, ...params } = rule

        switch (type) {
          case 'minLength':
            error = this.minLength(value, params.min, fieldName)
            break
          case 'maxLength':
            error = this.maxLength(value, params.max, fieldName)
            break
          case 'min':
            error = this.min(value, params.min, fieldName)
            break
          case 'max':
            error = this.max(value, params.max, fieldName)
            break
          case 'age':
            error = this.age(value, params.min, params.max)
            break
          case 'password':
            error = this.password(value, params.minLength)
            break
          default:
            console.warn(`Unknown validation rule type: ${type}`)
        }
      }

      if (error) return error
    }

    return null
  }

  /**
   * Validate form object
   */
  static validateForm(formData, rules) {
    const errors = {}
    let isValid = true

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = formData[field]
      const error = this.validate(value, fieldRules, field)

      if (error) {
        errors[field] = error
        isValid = false
      }
    }

    return { isValid, errors }
  }
}

// Export for convenience
export const {
  required,
  email,
  phone,
  minLength,
  maxLength,
  date,
  pastDate,
  futureDate,
  numeric,
  min,
  max,
  url,
  bloodType,
  gender,
  age,
  password,
  passwordConfirmation,
  fileSize,
  fileType,
  validate,
  validateForm
} = Validator


