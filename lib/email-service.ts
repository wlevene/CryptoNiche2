import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface PriceAlertEmailData {
  userName: string;
  userEmail: string;
  cryptoName: string;
  cryptoSymbol: string;
  triggerPrice: number;
  previousPrice: number;
  changePercentage: number;
  alertType: 'price_change' | 'price_threshold';
  threshold: number;
  direction: 'up' | 'down' | 'both';
}

export class EmailService {
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  }

  private formatPercentage(percentage: number): string {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }

  private generateAlertEmailHtml(data: PriceAlertEmailData): string {
    const {
      userName,
      cryptoName,
      cryptoSymbol,
      triggerPrice,
      previousPrice,
      changePercentage,
      alertType,
      threshold,
      direction
    } = data;

    const isPositive = changePercentage > 0;
    const colorClass = isPositive ? '#10B981' : '#EF4444';
    const arrow = isPositive ? '↗️' : '↘️';

    let alertDescription = '';
    if (alertType === 'price_change') {
      alertDescription = `${cryptoSymbol} price changed by ${this.formatPercentage(changePercentage)} (threshold: ${direction === 'both' ? '±' : direction === 'up' ? '+' : '-'}${threshold}%)`;
    } else {
      alertDescription = `${cryptoSymbol} price crossed your ${direction} threshold of ${this.formatPrice(threshold)}`;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CryptoNiche Price Alert</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🚨 CryptoNiche Price Alert</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Your cryptocurrency price alert has been triggered</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #1a202c; margin: 0; font-size: 28px; font-weight: 700;">${cryptoName} (${cryptoSymbol})</h2>
            <div style="margin: 15px 0;">
              <span style="font-size: 36px; font-weight: 700; color: ${colorClass};">
                ${this.formatPrice(triggerPrice)} ${arrow}
              </span>
            </div>
            <div style="font-size: 18px; color: ${colorClass}; font-weight: 600;">
              ${this.formatPercentage(changePercentage)} from ${this.formatPrice(previousPrice)}
            </div>
          </div>

          <!-- Alert Details -->
          <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px;">Alert Details</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #718096;">Trigger Condition:</span>
              <span style="color: #2d3748; font-weight: 600;">${alertDescription}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #718096;">Previous Price:</span>
              <span style="color: #2d3748;">${this.formatPrice(previousPrice)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #718096;">Current Price:</span>
              <span style="color: #2d3748; font-weight: 600;">${this.formatPrice(triggerPrice)}</span>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/markets" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 16px;">
              View Market Details
            </a>
          </div>

          <!-- Footer Info -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Hello ${userName}, this alert was sent because you subscribed to ${cryptoSymbol} price notifications.
            </p>
            <p style="color: #718096; font-size: 12px; margin: 10px 0 0 0;">
              You can manage your alerts in your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/alerts" style="color: #667eea;">CryptoNiche dashboard</a>.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async sendPriceAlert(data: PriceAlertEmailData): Promise<boolean> {
    try {
      const html = this.generateAlertEmailHtml(data);
      
      const result = await resend.emails.send({
        from: 'CryptoNiche <noreply@resend.dev>', // 需要验证域名后更改
        to: [data.userEmail],
        subject: `🚨 ${data.cryptoSymbol} Price Alert: ${this.formatPercentage(data.changePercentage)} change`,
        html,
      });

      if (result.error) {
        console.error('Resend email error:', result.error);
        return false;
      }

      console.log('Email sent successfully:', result.data?.id);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendTestEmail(email: string): Promise<boolean> {
    try {
      const result = await resend.emails.send({
        from: 'CryptoNiche <noreply@resend.dev>',
        to: [email],
        subject: 'CryptoNiche Email Service Test',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Service Test</h2>
          <p>This is a test email from CryptoNiche to verify email functionality.</p>
          <p>If you receive this email, the email service is working correctly.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated test email from CryptoNiche.</p>
        </div>
        `,
      });

      if (result.error) {
        console.error('Test email error:', result.error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }
}