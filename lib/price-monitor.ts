/**
 * 价格变化监控和预警系统
 * 基于旧版本 main.py 逻辑重构，适配新的数据库结构
 */

import { createAdminClient } from '@/lib/supabase-admin';
import type { Database } from '@/lib/supabase';

// 类型定义
type PriceAlert = Database['public']['Tables']['user_alerts']['Row'];
type AlertLog = Database['public']['Tables']['alert_notifications']['Insert'];

interface PriceChange {
  cryptoId: number;
  symbol: string;
  name: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercentage: number;
  timestamp: string;
}

export class PriceMonitor {
  private supabase = createAdminClient();
  private isRunning = false;
  private checkInterval = 30 * 1000; // 30秒检查一次
  
  constructor() {
    this.supabase = createAdminClient();
  }

  /**
   * 监控所有活跃告警的价格变化
   */
  async monitorPriceChanges(): Promise<void> {
    try {
      console.log('Starting price monitoring cycle...');

      // TODO: 实现实际的价格监控逻辑
      // 这里需要与 alert service 和 crypto service 集成
      console.log('Price monitoring cycle completed');
    } catch (error) {
      console.error('Error in price monitoring:', error);
    }
  }

  /**
   * 计算前一时期的价格
   */
  private calculatePreviousPrice(currentPrice: number, change24h: number): number {
    // 基于24小时变化计算前一价格
    return currentPrice / (1 + change24h / 100);
  }

  /**
   * 检查是否应该触发告警
   */
  private shouldTriggerAlert(alert: any, currentPrice: number, previousPrice: number): boolean {
    const changePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;

    // 检查频率限制 - 避免重复通知
    if (alert.last_triggered_at) {
      const lastTriggered = new Date(alert.last_triggered_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastTriggered.getTime();
      
      // 根据通知频率设置最小间隔
      let minInterval = 0;
      switch (alert.notification_frequency) {
        case 'immediate':
          minInterval = 5 * 60 * 1000; // 5分钟
          break;
        case 'hourly':
          minInterval = 60 * 60 * 1000; // 1小时
          break;
        case 'daily':
          minInterval = 24 * 60 * 60 * 1000; // 24小时
          break;
      }

      if (timeDiff < minInterval) {
        return false;
      }
    }

    if (alert.alert_type === 'price_change' && alert.threshold_percentage) {
      const threshold = alert.threshold_percentage;
      
      if (alert.direction === 'up' && changePercentage >= threshold) {
        return true;
      } else if (alert.direction === 'down' && changePercentage <= -threshold) {
        return true;
      } else if (alert.direction === 'both' && Math.abs(changePercentage) >= threshold) {
        return true;
      }
    } else if (alert.alert_type === 'price_threshold' && alert.threshold_price) {
      const threshold = alert.threshold_price;
      
      if (alert.direction === 'up' && currentPrice >= threshold && previousPrice < threshold) {
        return true;
      } else if (alert.direction === 'down' && currentPrice <= threshold && previousPrice > threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * 触发告警通知
   */
  private async triggerAlert(alert: any, crypto: any, currentPrice: number, previousPrice: number): Promise<void> {
    try {
      const changePercentage = ((currentPrice - previousPrice) / previousPrice) * 100;
      
      console.log(`Triggering alert for ${crypto.symbol}: ${changePercentage.toFixed(2)}%`);

      // TODO: 实现实际的告警触发逻辑
      // 这里需要与 alert service 和 email service 集成

    } catch (error) {
      console.error('Error triggering alert:', error);
    }
  }

  /**
   * 处理待发送的通知队列
   */
  async processPendingNotifications(): Promise<void> {
    try {
      console.log('Processing pending notifications...');
      // TODO: 实现实际的通知处理逻辑
      // 这里需要与 alert service 和 email service 集成
    } catch (error) {
      console.error('Error processing pending notifications:', error);
    }
  }

  /**
   * 获取预警统计信息
   */
  async getAlertStats() {
    try {
      // 活跃预警数量
      const { count: activeAlerts } = await this.supabase
        .from('user_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 今日触发的预警数量
      const today = new Date().toISOString().split('T')[0];
      const { count: todayTriggered } = await this.supabase
        .from('alert_notifications')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00Z`)
        .lt('created_at', `${today}T23:59:59Z`);

      return {
        activeAlerts: activeAlerts || 0,
        todayTriggered: todayTriggered || 0,
        isRunning: this.isRunning,
      };
    } catch (error) {
      console.error('获取预警统计失败:', error);
      return {
        activeAlerts: 0,
        todayTriggered: 0,
        isRunning: this.isRunning,
      };
    }
  }

  /**
   * 启动价格监控服务
   */
  async startMonitoring() {
    if (this.isRunning) {
      console.log('价格监控服务已在运行');
      return;
    }

    console.log('启动价格变化监控服务...');
    this.isRunning = true;

    // 定期检查价格变化和触发预警
    const monitorInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(monitorInterval);
        return;
      }

      try {
        console.log(`[${new Date().toISOString()}] 检查价格变化...`);
        // 实际的价格监控逻辑可以在这里实现
      } catch (error) {
        console.error('价格监控检查失败:', error);
      }
    }, this.checkInterval);

    console.log(`价格监控服务已启动，检查间隔: ${this.checkInterval / 1000} 秒`);
  }

  /**
   * 停止价格监控服务
   */
  stopMonitoring() {
    console.log('停止价格监控服务...');
    this.isRunning = false;
  }
}

// 导出单例实例
export const priceMonitor = new PriceMonitor();