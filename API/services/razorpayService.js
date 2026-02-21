const crypto = require('crypto');
const Razorpay = require('razorpay');
const db = require('../config/db');

class RazorpayService {
  constructor() {
    this.keyId = null;
    this.keySecret = null;
    this.razorpay = null;
  }

  async getPaymentSettings() {
    try {
      const [rows] = await db.execute('SELECT * FROM payment_settings LIMIT 1');
      return rows[0];
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      return null;
    }
  }

  async getCredentials() {
    const settings = await this.getPaymentSettings();
    this.keyId = settings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    this.keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
    
    // Initialize Razorpay instance
    if (this.keyId && this.keySecret) {
      this.razorpay = new Razorpay({
        key_id: this.keyId,
        key_secret: this.keySecret
      });
    }
    
    return { keyId: this.keyId, keySecret: this.keySecret };
  }

  async createOrder(amount, receipt, notes = {}) {
    try {
      await this.getCredentials();

      if (!this.keyId || !this.keySecret) {
        throw new Error('Razorpay credentials not configured. Please configure payment settings in admin panel.');
      }

      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: receipt,
        notes: notes
      };

      // Create order using Razorpay SDK
      const order = await this.razorpay.orders.create(options);
      
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId, orderId, signature) {
    try {
      await this.getCredentials();

      if (!this.keySecret) {
        throw new Error('Razorpay key secret not configured');
      }

      // Verify signature using HMAC SHA256
      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }

  generateInvoiceUrl(bookingId, paymentId) {
    // Generate invoice URL
    return `https://razorpay.com/invoices/${paymentId}`;
  }
}

module.exports = new RazorpayService();
