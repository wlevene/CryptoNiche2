/**
 * React Query Hooks for Alert Service
 * 为告警服务提供缓存和状态管理
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertServiceV2 } from '@/lib/services/alert-service-v2';
import type {
  AlertListReq,
  Alert,
  NotificationListReq,
} from '@/lib/types/api-v1';

// Query Keys
export const alertKeys = {
  all: ['alert'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (params: AlertListReq) => [...alertKeys.lists(), params] as const,
  notifications: () => [...alertKeys.all, 'notifications'] as const,
  notificationList: (params: NotificationListReq) =>
    [...alertKeys.notifications(), params] as const,
};

/**
 * 获取告警列表
 */
export function useAlerts(params: AlertListReq = {}) {
  return useQuery({
    queryKey: alertKeys.list(params),
    queryFn: () => alertServiceV2.getAlerts(params),
    staleTime: 1000 * 60 * 1, // 1 分钟
  });
}

/**
 * 创建告警
 */
export function useCreateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alert: Partial<Alert>) => alertServiceV2.createAlert(alert),
    onSuccess: () => {
      // 刷新告警列表
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}

/**
 * 更新告警
 */
export function useUpdateAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, alert }: { id: string; alert: Partial<Alert> }) =>
      alertServiceV2.updateAlert(id, alert),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}

/**
 * 删除告警
 */
export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => alertServiceV2.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}

/**
 * 切换告警状态
 */
export function useToggleAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      alertServiceV2.toggleAlert(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
    },
  });
}

/**
 * 获取通知列表
 */
export function useNotifications(params: NotificationListReq = {}) {
  return useQuery({
    queryKey: alertKeys.notificationList(params),
    queryFn: () => alertServiceV2.getNotifications(params),
    staleTime: 1000 * 30, // 30 秒
  });
}

/**
 * 标记通知已读
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string) => alertServiceV2.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: alertKeys.notifications() });
    },
  });
}
