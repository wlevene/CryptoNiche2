import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import type { Database } from '@/lib/supabase';

type UserAlert = Database['public']['Tables']['user_alerts']['Row'];
type UserAlertInsert = Database['public']['Tables']['user_alerts']['Insert'];
type UserAlertUpdate = Database['public']['Tables']['user_alerts']['Update'];
type AlertNotification = Database['public']['Tables']['alert_notifications']['Row'];
type AlertNotificationInsert = Database['public']['Tables']['alert_notifications']['Insert'];

export class AlertService {
  private async getSupabase() {
    return await createClient();
  }

  private getAdminSupabase() {
    return createAdminClient();
  }

  /**
   * 创建新的价格告警
   */
  async createAlert(alert: UserAlertInsert): Promise<UserAlert> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('user_alerts')
      .insert(alert)
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      throw error;
    }

    return data;
  }

  /**
   * 获取用户的所有告警
   */
  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('user_alerts')
      .select(`
        *,
        top_cryptocurrencies!inner (
          id,
          name,
          symbol,
          price,
          percent_change_24h
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user alerts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 更新告警设置
   */
  async updateAlert(alertId: string, updates: UserAlertUpdate): Promise<UserAlert> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('user_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      throw error;
    }

    return data;
  }

  /**
   * 删除告警
   */
  async deleteAlert(alertId: string): Promise<void> {
    const supabase = await this.getSupabase();
    const { error } = await supabase
      .from('user_alerts')
      .delete()
      .eq('id', alertId);

    if (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  /**
   * 切换告警激活状态
   */
  async toggleAlert(alertId: string, isActive: boolean): Promise<UserAlert> {
    return this.updateAlert(alertId, { is_active: isActive });
  }

  /**
   * 获取活跃的告警（用于价格监控）
   */
  async getActiveAlerts(): Promise<UserAlert[]> {
    const supabase = this.getAdminSupabase();
    const { data, error } = await supabase
      .from('user_alerts')
      .select(`
        *,
        top_cryptocurrencies!inner (
          id,
          name,
          symbol,
          price,
          percent_change_24h
        ),
        users (
          id,
          email,
          name
        )
      `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active alerts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 检查价格变化并触发告警
   */
  async checkPriceAlerts(cryptoId: number, currentPrice: number, previousPrice: number): Promise<void> {
    const changePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    const supabase = this.getAdminSupabase();
    const { data: alerts, error } = await supabase
      .from('user_alerts')
      .select(`
        *,
        users (
          id,
          email,
          name
        )
      `)
      .eq('crypto_id', cryptoId)
      .eq('is_active', true);

    if (error || !alerts) {
      console.error('Error fetching alerts for price check:', error);
      return;
    }

    for (const alert of alerts) {
      let shouldTrigger = false;

      if (alert.alert_type === 'price_change' && alert.threshold_percentage) {
        const threshold = alert.threshold_percentage;
        
        if (alert.direction === 'up' && changePercentage >= threshold) {
          shouldTrigger = true;
        } else if (alert.direction === 'down' && changePercentage <= -threshold) {
          shouldTrigger = true;
        } else if (alert.direction === 'both' && Math.abs(changePercentage) >= threshold) {
          shouldTrigger = true;
        }
      } else if (alert.alert_type === 'price_threshold' && alert.threshold_price) {
        const threshold = alert.threshold_price;
        
        if (alert.direction === 'up' && currentPrice >= threshold && previousPrice < threshold) {
          shouldTrigger = true;
        } else if (alert.direction === 'down' && currentPrice <= threshold && previousPrice > threshold) {
          shouldTrigger = true;
        }
      }

      if (shouldTrigger) {
        await this.createNotification({
          alert_id: alert.id,
          user_id: alert.user_id,
          crypto_id: cryptoId,
          trigger_price: currentPrice,
          previous_price: previousPrice,
          price_change_percentage: changePercentage,
        });

        // 更新最后触发时间
        await supabase
          .from('user_alerts')
          .update({ last_triggered_at: new Date().toISOString() })
          .eq('id', alert.id);
      }
    }
  }

  /**
   * 创建告警通知记录
   */
  async createNotification(notification: AlertNotificationInsert): Promise<AlertNotification> {
    const supabase = this.getAdminSupabase();
    const { data, error } = await supabase
      .from('alert_notifications')
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    return data;
  }

  /**
   * 获取用户的通知历史
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<AlertNotification[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from('alert_notifications')
      .select(`
        *,
        cryptocurrencies (
          id,
          name,
          symbol
        ),
        user_alerts (
          id,
          alert_type,
          threshold_percentage,
          threshold_price,
          direction
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * 更新通知状态
   */
  async updateNotificationStatus(
    notificationId: string, 
    status: 'sent' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    const supabase = this.getAdminSupabase();
    const { error } = await supabase
      .from('alert_notifications')
      .update({ 
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        error_message: errorMessage || null
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error updating notification status:', error);
      throw error;
    }
  }

  /**
   * 获取待发送的通知
   */
  async getPendingNotifications(): Promise<AlertNotification[]> {
    const supabase = this.getAdminSupabase();
    const { data, error } = await supabase
      .from('alert_notifications')
      .select(`
        *,
        cryptocurrencies (
          id,
          name,
          symbol
        ),
        users (
          id,
          email,
          name
        ),
        user_alerts (
          id,
          alert_type,
          threshold_percentage,
          threshold_price,
          direction
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching pending notifications:', error);
      throw error;
    }

    return data || [];
  }
}