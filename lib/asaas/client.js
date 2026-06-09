// Asaas MCP Server - Financial Automation
import { AsaasClient } from 'asaas-sdk';

// Initialize Asaas client with your API key
const asaas = new AsaasClient({
  apiKey: process.env.ASAAS_API_KEY,
  sandbox: process.env.NODE_ENV !== 'production' // Use sandbox for testing
});

export class AsaasMCPServer {
  constructor() {
    this.client = asaas;
  }

  // ============================================
  // 1. CUSTOMER MANAGEMENT (Automated)
  // ============================================
  
  async createCustomer(customerData) {
    const customer = await this.client.customers.create({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      mobilePhone: customerData.mobilePhone,
      cpfCnpj: customerData.cpfCnpj,
      postalCode: customerData.postalCode,
      address: customerData.address,
      addressNumber: customerData.addressNumber,
      complement: customerData.complement,
      province: customerData.province,
      externalReference: customerData.id // Link to your internal ID
    });
    
    return customer;
  }
  
  async getCustomer(externalReference) {
    return await this.client.customers.getByExternalReference(externalReference);
  }

  // ============================================
  // 2. PAYMENT AUTOMATION (The core feature)
  // ============================================
  
  async createPayment(paymentData) {
    const payment = await this.client.payments.create({
      customer: paymentData.customerId,
      billingType: paymentData.billingType, // CREDIT_CARD, BOLETO, PIX, UNDEFINED
      value: paymentData.amount,
      dueDate: paymentData.dueDate,
      description: paymentData.description,
      externalReference: paymentData.invoiceId,
      installmentCount: paymentData.installments || 1,
      installmentValue: paymentData.installmentValue,
      remoteIp: paymentData.remoteIp
    });
    
    return payment;
  }
  
  async getPaymentStatus(paymentId) {
    return await this.client.payments.getStatus(paymentId);
  }
  
  async cancelPayment(paymentId) {
    return await this.client.payments.cancel(paymentId);
  }
  
  async refundPayment(paymentId) {
    return await this.client.payments.refund(paymentId);
  }

  // ============================================
  // 3. SUBSCRIPTION MANAGEMENT (Recurring billing)
  // ============================================
  
  async createSubscription(subscriptionData) {
    const subscription = await this.client.subscriptions.create({
      customer: subscriptionData.customerId,
      billingType: subscriptionData.billingType,
      value: subscriptionData.amount,
      nextDueDate: subscriptionData.startDate,
      cycle: subscriptionData.cycle, // MONTHLY, WEEKLY, QUARTERLY, SEMIANNUALLY, YEARLY
      description: subscriptionData.description,
      externalReference: subscriptionData.invoiceId
    });
    
    return subscription;
  }
  
  async cancelSubscription(subscriptionId) {
    return await this.client.subscriptions.cancel(subscriptionId);
  }
  
  async getSubscription(subscriptionId) {
    return await this.client.subscriptions.getById(subscriptionId);
  }

  // ============================================
  // 4. PAYMENT NOTIFICATION (Webhooks)
  // ============================================
  
  async handleWebhook(payload) {
    const event = payload.event;
    
    switch(event) {
      case 'PAYMENT_RECEIVED':
        await this.onPaymentReceived(payload.payment);
        break;
      case 'PAYMENT_OVERDUE':
        await this.onPaymentOverdue(payload.payment);
        break;
      case 'PAYMENT_REFUNDED':
        await this.onPaymentRefunded(payload.payment);
        break;
      case 'SUBSCRIPTION_CREATED':
        await this.onSubscriptionCreated(payload.subscription);
        break;
      case 'SUBSCRIPTION_CANCELED':
        await this.onSubscriptionCanceled(payload.subscription);
        break;
    }
    
    return { received: true };
  }
  
  async onPaymentReceived(payment) {
    // Auto-update invoice status in your database
    const supabase = createClient();
    await supabase.from('invoices')
      .update({ status: 'paid', paid_at: new Date() })
      .eq('id', payment.externalReference);
    
    // Auto-send receipt email
    console.log(`Payment received for invoice ${payment.externalReference}`);
  }
  
  async onPaymentOverdue(payment) {
    // Auto-send reminder
    console.log(`Payment overdue for invoice ${payment.externalReference}`);
  }

  // ============================================
  // 5. BILLET/PIX AUTOMATION
  // ============================================
  
  async generateBillet(paymentData) {
    const payment = await this.createPayment({
      ...paymentData,
      billingType: 'BOLETO'
    });
    
    return {
      id: payment.id,
      barcode: payment.barCode,
      billetUrl: payment.bankSlipUrl,
      dueDate: payment.dueDate
    };
  }
  
  async generatePIX(paymentData) {
    const payment = await this.createPayment({
      ...paymentData,
      billingType: 'PIX'
    });
    
    return {
      id: payment.id,
      qrCode: payment.pixQrCode,
      payload: payment.pixPayload,
      expiresAt: payment.pixExpirationDate
    };
  }

  // ============================================
  // 6. AUTOMATED WORKFLOWS
  // ============================================
  
  async syncInvoiceToAsaas(invoice) {
    // Automatically create Asaas payment when invoice is created
    const customer = await this.getCustomer(invoice.client_id);
    
    if (!customer) {
      // Auto-create customer
      const newCustomer = await this.createCustomer({
        name: invoice.clients.name,
        email: invoice.clients.email,
        externalReference: invoice.client_id
      });
    }
    
    const payment = await this.createPayment({
      customerId: customer?.id || newCustomer.id,
      amount: invoice.total,
      dueDate: invoice.due_date,
      description: `Invoice ${invoice.invoice_number}`,
      billingType: 'UNDEFINED', // Let customer choose
      externalReference: invoice.id
    });
    
    return payment;
  }
  
  async sendAutomatedReminders() {
    // Get overdue invoices from your database
    const supabase = createClient();
    const { data: overdueInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', 'sent')
      .lt('due_date', new Date().toISOString());
    
    for (const invoice of overdueInvoices) {
      // Send reminder via Asaas
      await this.client.payments.sendReminder(invoice.id);
      
      // Add late fee if configured
      if (invoice.late_fee_enabled) {
        await this.client.payments.addFine(invoice.id, invoice.late_fee_percentage);
      }
    }
    
    return { remindersSent: overdueInvoices.length };
  }
}

export const asaasMCP = new AsaasMCPServer();
