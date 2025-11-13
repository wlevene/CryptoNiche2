/**
 * 告警服务
 * 封装所有与告警相关的 API 调用
 */

import apiClient from '@/lib/api-client';
import type {
  AlertListReq,
  AlertListReply,
  Alert,
  NotificationListReq,
  NotificationListReply,
  MarkNotificationReadReq,
  MarkNotificationReadReply,
} from '@/lib/types/api-v1';

/**
 * 告警服务类
 */
export class AlertServiceV2 {
  /**
   * 获取告警列表
   */
  async getAlerts(params?: AlertListReq): Promise<AlertListReply> {
    return apiClient.get<AlertListReply>('/api/v1/currency/alerts', params);
  }

  /**
   * 创建告警
   */
  async createAlert(alert: Partial<Alert>): Promise<Alert> {
    return apiClient.post<Alert>('/api/v1/currency/alerts', alert);
  }

  /**
   * 更新告警
   */
  async updateAlert(id: string, alert: Partial<Alert>): Promise<Alert> {
    return apiClient.put<Alert>(`/api/v1/currency/alerts/${id}`, alert);
  }

  /**
   * 删除告警
   */
  async deleteAlert(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/v1/currency/alerts/${id}`);
  }

  /**
   * 切换告警状态
   */
  async toggleAlert(id: string, isActive: boolean): Promise<Alert> {
    return apiClient.patch<Alert>(`/api/v1/currency/alerts/${id}/toggle`, {
      is_active: isActive,
    });
  }

  /**
   * 获取通知列表
   */
  async getNotifications(params?: NotificationListReq): Promise<NotificationListReply> {
    return apiClient.get<NotificationListReply>('/api/v1/currency/notifications', params);
  }

  /**
   * 标记通知为已读
   */
  async markNotificationRead(id?: string): Promise<MarkNotificationReadReply> {
    return apiClient.post<MarkNotificationReadReply>(
      '/api/v1/currency/notification/read',
      { id }
    );
  }

  /**
   * 标记所有通知为已读
   */
  async markAllNotificationsRead(): Promise<MarkNotificationReadReply> {
    return this.markNotificationRead();
  }
}

// 导出单例
export const alertServiceV2 = new AlertServiceV2();

// 默认导出
export default alertServiceV2;
