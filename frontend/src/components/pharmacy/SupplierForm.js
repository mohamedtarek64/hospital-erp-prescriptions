import { ref, watch } from 'vue'
import { useSupplierManager } from '@/managers/supplierManager'

export class SupplierFormManager {
  constructor(props, emit) {
    this.props = props
    this.emit = emit
    this.supplierManager = useSupplierManager()

    // Form state
    this.form = ref({
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      tax_number: '',
      credit_limit: '',
      payment_terms: '',
      status: 'active',
      notes: ''
    })

    this.errors = ref({})
    this.isSubmitting = ref(false)

    // Data
    this.countries = ref([])
    this.cities = ref([])

    // Watch for supplier prop changes
    this.watchSupplierChanges()
  }

  // Computed properties
  get isEditing() {
    return !!this.props.supplier
  }

  // Watch for supplier prop changes
  watchSupplierChanges() {
    watch(() => this.props.supplier, (newSupplier) => {
      if (newSupplier) {
        this.populateForm(newSupplier)
      } else {
        this.resetForm()
      }
    }, { immediate: true })
  }

  // Initialize form
  initializeForm() {
    if (this.props.supplier) {
      this.populateForm(this.props.supplier)
    } else {
      this.resetForm()
    }
  }

  // Populate form with existing supplier data
  populateForm(supplier) {
    this.form.value = {
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      country: supplier.country || '',
      city: supplier.city || '',
      address: supplier.address || '',
      tax_number: supplier.tax_number || '',
      credit_limit: supplier.credit_limit || '',
      payment_terms: supplier.payment_terms || '',
      status: supplier.status || 'active',
      notes: supplier.notes || ''
    }
  }

  // Reset form to initial state
  resetForm() {
    this.form.value = {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      country: '',
      city: '',
      address: '',
      tax_number: '',
      credit_limit: '',
      payment_terms: '',
      status: 'active',
      notes: ''
    }
    this.errors.value = {}
  }

  // Initialize data (countries, cities)
  async initializeData() {
    try {
      await Promise.all([
        this.loadCountries(),
        this.loadCities()
      ])
    } catch (error) {
      console.error('Error initializing supplier form data:', error)
    }
  }

  // Load countries
  async loadCountries() {
    try {
      this.countries.value = await this.supplierManager.getCountries()
    } catch (error) {
      console.error('Error loading countries:', error)
      this.countries.value = []
    }
  }

  // Load cities
  async loadCities() {
    try {
      this.cities.value = await this.supplierManager.getCities()
    } catch (error) {
      console.error('Error loading cities:', error)
      this.cities.value = []
    }
  }

  // Handle country change
  handleCountryChange() {
    // Reset city when country changes
    this.form.value.city = ''
    
    // Load cities for selected country
    if (this.form.value.country) {
      this.loadCitiesForCountry(this.form.value.country)
    }
  }

  // Load cities for specific country
  async loadCitiesForCountry(country) {
    try {
      // This would typically call an API to get cities for a specific country
      // For now, we'll use a simple mapping
      const countryCities = {
        'مصر': ['القاهرة', 'الإسكندرية', 'الجيزة', 'المنصورة', 'طنطا'],
        'السعودية': ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام'],
        'الإمارات': ['دبي', 'أبو ظبي', 'الشارقة', 'العين', 'رأس الخيمة'],
        'الكويت': ['الكويت', 'حولي', 'الجهراء', 'مبارك الكبير', 'الأحمدي'],
        'قطر': ['الدوحة', 'الوكرة', 'الخور', 'الريان', 'أم صلال']
      }
      
      this.cities.value = countryCities[country] || []
    } catch (error) {
      console.error('Error loading cities for country:', error)
      this.cities.value = []
    }
  }

  // Validate form data
  validateForm() {
    this.errors.value = {}

    // Required fields
    if (!this.form.value.name.trim()) {
      this.errors.value.name = 'اسم المورد مطلوب'
    }

    if (!this.form.value.email.trim()) {
      this.errors.value.email = 'البريد الإلكتروني مطلوب'
    } else if (!this.isValidEmail(this.form.value.email)) {
      this.errors.value.email = 'البريد الإلكتروني غير صحيح'
    }

    if (!this.form.value.phone.trim()) {
      this.errors.value.phone = 'رقم الهاتف مطلوب'
    } else if (!this.isValidPhone(this.form.value.phone)) {
      this.errors.value.phone = 'رقم الهاتف غير صحيح'
    }

    if (!this.form.value.status) {
      this.errors.value.status = 'الحالة مطلوبة'
    }

    // Optional field validations
    if (this.form.value.credit_limit && parseFloat(this.form.value.credit_limit) < 0) {
      this.errors.value.credit_limit = 'حد الائتمان يجب أن يكون موجب'
    }

    if (this.form.value.tax_number && this.form.value.tax_number.length < 5) {
      this.errors.value.tax_number = 'الرقم الضريبي يجب أن يكون 5 أرقام على الأقل'
    }

    return Object.keys(this.errors.value).length === 0
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Phone validation
  isValidPhone(phone) {
    const phoneRegex = /^[+]?[0-9\s\-()]{8,}$/
    return phoneRegex.test(phone)
  }

  // Handle form submission
  async handleSubmit() {
    if (!this.validateForm()) {
      return
    }

    this.isSubmitting.value = true

    try {
      const supplierData = {
        name: this.form.value.name.trim(),
        contact_person: this.form.value.contact_person.trim(),
        email: this.form.value.email.trim().toLowerCase(),
        phone: this.form.value.phone.trim(),
        country: this.form.value.country,
        city: this.form.value.city,
        address: this.form.value.address.trim(),
        tax_number: this.form.value.tax_number.trim(),
        credit_limit: this.form.value.credit_limit ? parseFloat(this.form.value.credit_limit) : null,
        payment_terms: this.form.value.payment_terms,
        status: this.form.value.status,
        notes: this.form.value.notes.trim()
      }

      if (this.isEditing) {
        await this.supplierManager.updateSupplier(this.props.supplier.id, supplierData)
      } else {
        await this.supplierManager.createSupplier(supplierData)
      }

      // Emit success
      this.emit('submit', supplierData)
      
      // Reset form
      this.resetForm()
      
    } catch (error) {
      console.error('Error submitting supplier form:', error)
      
      // Handle specific error types
      if (error.response?.data?.errors) {
        this.errors.value = error.response.data.errors
      } else {
        this.errors.value.general = 'حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.'
      }
    } finally {
      this.isSubmitting.value = false
    }
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return ''
    
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
    } else if (cleaned.length === 11) {
      return `+${cleaned.slice(0,1)} (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`
    }
    
    return phone
  }

  // Format credit limit for display
  formatCreditLimit(amount) {
    if (!amount) return '0.00'
    return parseFloat(amount).toFixed(2)
  }

  // Get payment terms display text
  getPaymentTermsText(terms) {
    const termsMap = {
      'immediate': 'دفع فوري',
      '7_days': '7 أيام',
      '15_days': '15 يوم',
      '30_days': '30 يوم',
      '45_days': '45 يوم',
      '60_days': '60 يوم'
    }
    return termsMap[terms] || terms
  }

  // Get status display text
  getStatusText(status) {
    const statusMap = {
      'active': 'نشط',
      'inactive': 'غير نشط',
      'suspended': 'معلق'
    }
    return statusMap[status] || status
  }
}

export function useSupplierFormManager(props, emit) {
  const manager = new SupplierFormManager(props, emit)
  
  return {
    // Reactive state
    form: manager.form,
    errors: manager.errors,
    isSubmitting: manager.isSubmitting,
    countries: manager.countries,
    cities: manager.cities,

    // Computed properties
    isEditing: manager.isEditing,

    // Methods
    handleSubmit: manager.handleSubmit.bind(manager),
    handleCountryChange: manager.handleCountryChange.bind(manager),
    initializeForm: manager.initializeForm.bind(manager),
    initializeData: manager.initializeData.bind(manager),
    resetForm: manager.resetForm.bind(manager),
    validateForm: manager.validateForm.bind(manager),
    populateForm: manager.populateForm.bind(manager),
    formatPhoneNumber: manager.formatPhoneNumber.bind(manager),
    formatCreditLimit: manager.formatCreditLimit.bind(manager),
    getPaymentTermsText: manager.getPaymentTermsText.bind(manager),
    getStatusText: manager.getStatusText.bind(manager)
  }
}
