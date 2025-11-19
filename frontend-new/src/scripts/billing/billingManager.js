import { billingApi } from '@/services/api/billingApi'

export class billingManager {
  constructor() {
    this.api = billingApi
  }

  /**
   * Get billing dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await this.api.getDashboardStats()
      return response.data
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw error
    }
  }

  /**
   * Get recent billing activity
   */
  async getRecentActivity() {
    try {
      const response = await this.api.getRecentActivity()
      return response.data
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      throw error
    }
  }

  /**
   * Get all invoices with filters
   */
  async getInvoices(filters = {}) {
    try {
      const response = await this.api.getInvoices(filters)
      return response.data
    } catch (error) {
      console.error('Error fetching invoices:', error)
      throw error
    }
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(id) {
    try {
      const response = await this.api.getInvoice(id)
      return response.data
    } catch (error) {
      console.error('Error fetching invoice:', error)
      throw error
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(invoiceData) {
    try {
      const response = await this.api.createInvoice(invoiceData)
      return response.data
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(id, updateData) {
    try {
      const response = await this.api.updateInvoice(id, updateData)
      return response.data
    } catch (error) {
      console.error('Error updating invoice:', error)
      throw error
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id) {
    try {
      const response = await this.api.deleteInvoice(id)
      return response.data
    } catch (error) {
      console.error('Error deleting invoice:', error)
      throw error
    }
  }

  /**
   * Get all payments with filters
   */
  async getPayments(filters = {}) {
    try {
      const response = await this.api.getPayments(filters)
      return response.data
    } catch (error) {
      console.error('Error fetching payments:', error)
      throw error
    }
  }

  /**
   * Get single payment by ID
   */
  async getPayment(id) {
    try {
      const response = await this.api.getPayment(id)
      return response.data
    } catch (error) {
      console.error('Error fetching payment:', error)
      throw error
    }
  }

  /**
   * Create new payment
   */
  async createPayment(paymentData) {
    try {
      const response = await this.api.createPayment(paymentData)
      return response.data
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  }

  /**
   * Update payment
   */
  async updatePayment(id, updateData) {
    try {
      const response = await this.api.updatePayment(id, updateData)
      return response.data
    } catch (error) {
      console.error('Error updating payment:', error)
      throw error
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(id) {
    try {
      const response = await this.api.deletePayment(id)
      return response.data
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  }

  /**
   * Get all services
   */
  async getServices() {
    try {
      const response = await this.api.getServices()
      return response.data
    } catch (error) {
      console.error('Error fetching services:', error)
      throw error
    }
  }

  /**
   * Get service categories
   */
  async getServiceCategories() {
    try {
      const response = await this.api.getServiceCategories()
      return response.data
    } catch (error) {
      console.error('Error fetching service categories:', error)
      throw error
    }
  }

  /**
   * Get insurance claims
   */
  async getInsuranceClaims(filters = {}) {
    try {
      const response = await this.api.getInsuranceClaims(filters)
      return response.data
    } catch (error) {
      console.error('Error fetching insurance claims:', error)
      throw error
    }
  }

  /**
   * Create insurance claim
   */
  async createInsuranceClaim(claimData) {
    try {
      const response = await this.api.createInsuranceClaim(claimData)
      return response.data
    } catch (error) {
      console.error('Error creating insurance claim:', error)
      throw error
    }
  }

  /**
   * Update insurance claim
   */
  async updateInsuranceClaim(id, updateData) {
    try {
      const response = await this.api.updateInsuranceClaim(id, updateData)
      return response.data
    } catch (error) {
      console.error('Error updating insurance claim:', error)
      throw error
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    try {
      const response = await this.api.getPaymentStats()
      return response.data
    } catch (error) {
      console.error('Error fetching payment stats:', error)
      throw error
    }
  }

  /**
   * Get insurance claim statistics
   */
  async getInsuranceClaimStats() {
    try {
      const response = await this.api.getInsuranceClaimStats()
      return response.data
    } catch (error) {
      console.error('Error fetching insurance claim stats:', error)
      throw error
    }
  }

  /**
   * Generate invoice number
   */
  async generateInvoiceNumber() {
    try {
      const response = await this.api.generateInvoiceNumber()
      return response.data.invoice_number
    } catch (error) {
      console.error('Error generating invoice number:', error)
      throw error
    }
  }

  /**
   * Send invoice reminder
   */
  async sendInvoiceReminder(invoiceId) {
    try {
      const response = await this.api.sendInvoiceReminder(invoiceId)
      return response.data
    } catch (error) {
      console.error('Error sending invoice reminder:', error)
      throw error
    }
  }

  /**
   * Get invoice summary for patient
   */
  async getPatientInvoiceSummary(patientId) {
    try {
      const response = await this.api.getPatientInvoiceSummary(patientId)
      return response.data
    } catch (error) {
      console.error('Error fetching patient invoice summary:', error)
      throw error
    }
  }

  /**
   * Get payments for specific invoice
   */
  async getInvoicePayments(invoiceId) {
    try {
      const response = await this.api.getInvoicePayments(invoiceId)
      return response.data
    } catch (error) {
      console.error('Error fetching invoice payments:', error)
      throw error
    }
  }

  /**
   * Get insurance claims for specific invoice
   */
  async getInvoiceInsuranceClaims(invoiceId) {
    try {
      const response = await this.api.getInvoiceInsuranceClaims(invoiceId)
      return response.data
    } catch (error) {
      console.error('Error fetching invoice insurance claims:', error)
      throw error
    }
  }

  /**
   * Process refund for payment
   */
  async processRefund(paymentId, refundData) {
    try {
      const response = await this.api.processRefund(paymentId, refundData)
      return response.data
    } catch (error) {
      console.error('Error processing refund:', error)
      throw error
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(paymentId) {
    try {
      const response = await this.api.generateReceipt(paymentId)
      return response.data
    } catch (error) {
      console.error('Error generating receipt:', error)
      throw error
    }
  }

  /**
   * Get overdue payments report
   */
  async getOverduePaymentsReport() {
    try {
      const response = await this.api.getOverduePaymentsReport()
      return response.data
    } catch (error) {
      console.error('Error fetching overdue payments report:', error)
      throw error
    }
  }

  /**
   * Get insurance providers list
   */
  async getInsuranceProviders() {
    try {
      const response = await this.api.getInsuranceProviders()
      return response.data
    } catch (error) {
      console.error('Error fetching insurance providers:', error)
      throw error
    }
  }
}
