<template>
  <div class="payslip-generator">
    <div class="generator-header">
      <h3 class="text-lg font-semibold text-gray-900">Payslip Generator</h3>
      <p class="text-sm text-gray-600">Generate and manage employee payslips</p>
    </div>

    <!-- Employee and Period Selection -->
    <div class="selection-section">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Employee Selection -->
        <div class="form-group">
          <label for="employee_id" class="form-label">Employee</label>
          <select
            id="employee_id"
            v-model="selectedEmployee"
            class="form-select"
            @change="onEmployeeChange"
          >
            <option value="">Select Employee</option>
            <option
              v-for="employee in employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.name }} ({{ employee.employee_id }})
            </option>
          </select>
        </div>

        <!-- Pay Period -->
        <div class="form-group">
          <label for="pay_period" class="form-label">Pay Period</label>
          <select
            id="pay_period"
            v-model="selectedPeriod"
            class="form-select"
            @change="onPeriodChange"
          >
            <option value="">Select Period</option>
            <option
              v-for="period in payPeriods"
              :key="period.value"
              :value="period.value"
            >
              {{ period.label }}
            </option>
          </select>
        </div>

        <!-- Generate Button -->
        <div class="form-group">
          <label class="form-label">&nbsp;</label>
          <button
            @click="generatePayslip"
            class="btn-primary w-full"
            :disabled="!selectedEmployee || !selectedPeriod || isGenerating"
          >
            <span v-if="isGenerating" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
            <span v-else>Generate Payslip</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Payslip Preview -->
    <div v-if="payslipData" class="payslip-preview">
      <div class="preview-header">
        <h4 class="text-md font-semibold text-gray-900">Payslip Preview</h4>
        <div class="preview-actions">
          <button @click="downloadPayslip" class="btn-secondary">
            <DocumentArrowDownIcon class="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <button @click="printPayslip" class="btn-secondary">
            <PrinterIcon class="h-4 w-4 mr-2" />
            Print
          </button>
          <button @click="emailPayslip" class="btn-secondary">
            <EnvelopeIcon class="h-4 w-4 mr-2" />
            Email
          </button>
        </div>
      </div>

      <div class="payslip-content">
        <!-- Company Header -->
        <div class="company-header">
          <div class="company-info">
            <h2 class="company-name">Cleopatra Hospital</h2>
            <p class="company-address">123 Medical Street, Healthcare City</p>
            <p class="company-contact">Phone: +1 (555) 123-4567 | Email: hr@cleopatrahospital.com</p>
          </div>
          <div class="payslip-title">
            <h1 class="title">PAYSLIP</h1>
            <p class="period">{{ formatPeriod(selectedPeriod) }}</p>
          </div>
        </div>

        <!-- Employee Information -->
        <div class="employee-info">
          <div class="info-grid">
            <div class="info-item">
              <label>Employee ID:</label>
              <span>{{ payslipData.employee.employee_id }}</span>
            </div>
            <div class="info-item">
              <label>Name:</label>
              <span>{{ payslipData.employee.name }}</span>
            </div>
            <div class="info-item">
              <label>Department:</label>
              <span>{{ payslipData.employee.department }}</span>
            </div>
            <div class="info-item">
              <label>Position:</label>
              <span>{{ payslipData.employee.position }}</span>
            </div>
            <div class="info-item">
              <label>Pay Date:</label>
              <span>{{ formatDate(payslipData.pay_date) }}</span>
            </div>
            <div class="info-item">
              <label>Pay Period:</label>
              <span>{{ formatPeriod(selectedPeriod) }}</span>
            </div>
          </div>
        </div>

        <!-- Earnings and Deductions -->
        <div class="pay-details">
          <div class="earnings-section">
            <h3 class="section-title">Earnings</h3>
            <div class="pay-items">
              <div class="pay-item">
                <span class="item-label">Basic Salary</span>
                <span class="item-amount">${{ formatCurrency(payslipData.basic_salary) }}</span>
              </div>
              <div class="pay-item" v-if="payslipData.overtime > 0">
                <span class="item-label">Overtime</span>
                <span class="item-amount">${{ formatCurrency(payslipData.overtime) }}</span>
              </div>
              <div class="pay-item" v-if="payslipData.bonus > 0">
                <span class="item-label">Bonus</span>
                <span class="item-amount">${{ formatCurrency(payslipData.bonus) }}</span>
              </div>
              <div class="pay-item" v-if="payslipData.allowances > 0">
                <span class="item-label">Allowances</span>
                <span class="item-amount">${{ formatCurrency(payslipData.allowances) }}</span>
              </div>
              <div class="pay-item total">
                <span class="item-label">Total Earnings</span>
                <span class="item-amount">${{ formatCurrency(payslipData.total_earnings) }}</span>
              </div>
            </div>
          </div>

          <div class="deductions-section">
            <h3 class="section-title">Deductions</h3>
            <div class="pay-items">
              <div class="pay-item" v-if="payslipData.tax > 0">
                <span class="item-label">Income Tax</span>
                <span class="item-amount">-${{ formatCurrency(payslipData.tax) }}</span>
              </div>
              <div class="pay-item" v-if="payslipData.social_security > 0">
                <span class="item-label">Social Security</span>
                <span class="item-amount">-${{ formatCurrency(payslipData.social_security) }}</span>
              </div>
              <div class="pay-item" v-if="payslipData.health_insurance > 0">
                <span class="item-label">Health Insurance</span>
                <span class="item-amount">-${{ formatCurrency(payslipData.health_insurance) }}</span>
              </div>
              <div class="pay-item" v-if="payslipData.other_deductions > 0">
                <span class="item-label">Other Deductions</span>
                <span class="item-amount">-${{ formatCurrency(payslipData.other_deductions) }}</span>
              </div>
              <div class="pay-item total">
                <span class="item-label">Total Deductions</span>
                <span class="item-amount">-${{ formatCurrency(payslipData.total_deductions) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Net Pay -->
        <div class="net-pay-section">
          <div class="net-pay">
            <span class="net-pay-label">Net Pay</span>
            <span class="net-pay-amount">${{ formatCurrency(payslipData.net_pay) }}</span>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="additional-info">
          <div class="info-grid">
            <div class="info-item">
              <label>Hours Worked:</label>
              <span>{{ payslipData.hours_worked }} hours</span>
            </div>
            <div class="info-item">
              <label>Overtime Hours:</label>
              <span>{{ payslipData.overtime_hours }} hours</span>
            </div>
            <div class="info-item">
              <label>Leave Days:</label>
              <span>{{ payslipData.leave_days }} days</span>
            </div>
            <div class="info-item">
              <label>Bank Account:</label>
              <span>****{{ payslipData.bank_account_last4 }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="payslip-footer">
          <p class="footer-text">
            This is a computer-generated payslip. No signature required.
          </p>
          <p class="footer-text">
            For any queries, please contact the HR department.
          </p>
        </div>
      </div>
    </div>

    <!-- Recent Payslips -->
    <div v-if="recentPayslips.length > 0" class="recent-payslips">
      <h4 class="text-md font-semibold text-gray-900 mb-4">Recent Payslips</h4>
      <div class="payslips-grid">
        <div
          v-for="payslip in recentPayslips"
          :key="payslip.id"
          class="payslip-card"
        >
          <div class="payslip-card-header">
            <div class="employee-info">
              <h5 class="employee-name">{{ payslip.employee_name }}</h5>
              <p class="employee-id">{{ payslip.employee_id }}</p>
            </div>
            <div class="payslip-amount">
              <span class="amount">${{ formatCurrency(payslip.net_pay) }}</span>
            </div>
          </div>
          <div class="payslip-card-body">
            <div class="payslip-details">
              <div class="detail-item">
                <span class="label">Period:</span>
                <span class="value">{{ formatPeriod(payslip.pay_period) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Pay Date:</span>
                <span class="value">{{ formatDate(payslip.pay_date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="status" :class="payslip.status">{{ payslip.status }}</span>
              </div>
            </div>
          </div>
          <div class="payslip-card-actions">
            <button @click="viewPayslip(payslip)" class="btn-sm btn-secondary">
              View
            </button>
            <button @click="downloadPayslipFile(payslip)" class="btn-sm btn-primary">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useHRStore } from '@/stores/hr'
import { DocumentArrowDownIcon, PrinterIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'

export default {
  name: 'PayslipGenerator',
  components: {
    DocumentArrowDownIcon,
    PrinterIcon,
    EnvelopeIcon
  },
  setup() {
    const hrStore = useHRStore()

    const selectedEmployee = ref('')
    const selectedPeriod = ref('')
    const isGenerating = ref(false)
    const payslipData = ref(null)
    const recentPayslips = ref([])

    const employees = computed(() => hrStore.employees)

    const payPeriods = [
      { value: '2024-01', label: 'January 2024' },
      { value: '2024-02', label: 'February 2024' },
      { value: '2024-03', label: 'March 2024' },
      { value: '2024-04', label: 'April 2024' },
      { value: '2024-05', label: 'May 2024' },
      { value: '2024-06', label: 'June 2024' },
      { value: '2024-07', label: 'July 2024' },
      { value: '2024-08', label: 'August 2024' },
      { value: '2024-09', label: 'September 2024' },
      { value: '2024-10', label: 'October 2024' },
      { value: '2024-11', label: 'November 2024' },
      { value: '2024-12', label: 'December 2024' }
    ]

    const onEmployeeChange = () => {
      if (selectedEmployee.value) {
        fetchRecentPayslips()
      }
    }

    const onPeriodChange = () => {
      // Period changed, clear current payslip
      payslipData.value = null
    }

    const generatePayslip = async () => {
      if (!selectedEmployee.value || !selectedPeriod.value) return

      isGenerating.value = true

      try {
        const response = await hrStore.generatePayslip({
          employee_id: selectedEmployee.value,
          pay_period: selectedPeriod.value
        })
        
        payslipData.value = response.data
      } catch (error) {
        console.error('Error generating payslip:', error)
        alert('Failed to generate payslip. Please try again.')
      } finally {
        isGenerating.value = false
      }
    }

    const fetchRecentPayslips = async () => {
      if (!selectedEmployee.value) return

      try {
        const response = await hrStore.getEmployeePayslips(selectedEmployee.value)
        recentPayslips.value = response.data.slice(0, 6) // Show last 6 payslips
      } catch (error) {
        console.error('Error fetching recent payslips:', error)
      }
    }

    const downloadPayslip = () => {
      if (!payslipData.value) return

      // Generate PDF and download
      const pdfContent = generatePDFContent(payslipData.value)
      downloadPDF(pdfContent, `payslip-${payslipData.value.employee.employee_id}-${selectedPeriod.value}.pdf`)
    }

    const printPayslip = () => {
      if (!payslipData.value) return

      const printWindow = window.open('', '_blank')
      printWindow.document.write(generatePrintContent(payslipData.value))
      printWindow.document.close()
      printWindow.print()
    }

    const emailPayslip = async () => {
      if (!payslipData.value) return

      try {
        await hrStore.emailPayslip({
          employee_id: selectedEmployee.value,
          pay_period: selectedPeriod.value
        })
        alert('Payslip sent successfully!')
      } catch (error) {
        console.error('Error emailing payslip:', error)
        alert('Failed to send payslip. Please try again.')
      }
    }

    const viewPayslip = (payslip) => {
      // Set the selected employee and period to view the payslip
      selectedEmployee.value = payslip.employee_id
      selectedPeriod.value = payslip.pay_period
      payslipData.value = payslip
    }

    const downloadPayslipFile = async (payslip) => {
      try {
        const response = await hrStore.downloadPayslip(payslip.id)
        const blob = new Blob([response.data], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `payslip-${payslip.employee_id}-${payslip.pay_period}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Error downloading payslip:', error)
        alert('Failed to download payslip. Please try again.')
      }
    }

    const formatCurrency = (amount) => {
      return parseFloat(amount).toFixed(2)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatPeriod = (period) => {
      if (!period) return ''
      const [year, month] = period.split('-')
      const date = new Date(year, month - 1)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    }

    const generatePDFContent = (data) => {
      // This would typically use a PDF generation library
      // For now, return HTML content that can be converted to PDF
      return `
        <html>
          <head>
            <title>Payslip - ${data.employee.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; }
              .payslip-title { font-size: 20px; font-weight: bold; margin-top: 20px; }
              .employee-info { margin-bottom: 20px; }
              .pay-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .earnings, .deductions { width: 48%; }
              .pay-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
              .net-pay { text-align: center; font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Cleopatra Hospital</div>
              <div class="payslip-title">PAYSLIP</div>
            </div>
            <div class="employee-info">
              <p><strong>Employee:</strong> ${data.employee.name} (${data.employee.employee_id})</p>
              <p><strong>Department:</strong> ${data.employee.department}</p>
              <p><strong>Pay Period:</strong> ${formatPeriod(selectedPeriod.value)}</p>
            </div>
            <div class="pay-details">
              <div class="earnings">
                <h3>Earnings</h3>
                <div class="pay-item">Basic Salary: $${formatCurrency(data.basic_salary)}</div>
                <div class="pay-item">Total Earnings: $${formatCurrency(data.total_earnings)}</div>
              </div>
              <div class="deductions">
                <h3>Deductions</h3>
                <div class="pay-item">Total Deductions: $${formatCurrency(data.total_deductions)}</div>
              </div>
            </div>
            <div class="net-pay">
              Net Pay: $${formatCurrency(data.net_pay)}
            </div>
          </body>
        </html>
      `
    }

    const generatePrintContent = (data) => {
      return generatePDFContent(data)
    }

    const downloadPDF = (content, filename) => {
      const blob = new Blob([content], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      window.URL.revokeObjectURL(url)
    }

    onMounted(() => {
      hrStore.fetchEmployees()
    })

    return {
      selectedEmployee,
      selectedPeriod,
      isGenerating,
      payslipData,
      recentPayslips,
      employees,
      payPeriods,
      onEmployeeChange,
      onPeriodChange,
      generatePayslip,
      downloadPayslip,
      printPayslip,
      emailPayslip,
      viewPayslip,
      downloadPayslipFile,
      formatCurrency,
      formatDate,
      formatPeriod
    }
  }
}
</script>
