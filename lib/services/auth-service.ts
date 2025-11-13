/**
 * 认证服务
 * 封装所有与认证相关的 API 调用
 */

import apiClient from '@/lib/api-client';
import type {
  UserRegisterReq,
  UserRegisterReply,
  LoginReq,
  LoginReply,
  GetLoginSmsCodeReq,
  LoginWithSmsReq,
  LoginWithSmsReply,
  LogoutReq,
  LogoutReply,
  ResetPasswordReq,
  ResetPasswordReply,
  ChangePasswordReq,
  ChangePasswordReply,
  AuthGoogleReq,
  User,
  UserDashboardReply,
} from '@/lib/types/api-v1';

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户注册
   */
  async register(data: UserRegisterReq): Promise<UserRegisterReply> {
    return apiClient.post<UserRegisterReply>('/auth/register', data);
  }

  /**
   * 用户登录
   */
  async login(data: LoginReq): Promise<LoginReply> {
    return apiClient.post<LoginReply>('/auth/login', data);
  }

  /**
   * 获取短信验证码
   */
  async getSmsCode(data: GetLoginSmsCodeReq): Promise<boolean> {
    return apiClient.post<boolean>('/auth/sms/code', data);
  }

  /**
   * 短信验证码登录
   */
  async loginWithSms(data: LoginWithSmsReq): Promise<LoginWithSmsReply> {
    return apiClient.post<LoginWithSmsReply>('/auth/login/sms', data);
  }

  /**
   * Google 认证登录
   */
  async authGoogle(data: AuthGoogleReq): Promise<LoginReply> {
    return apiClient.post<LoginReply>('/auth/google', data);
  }

  /**
   * 登出
   */
  async logout(data: LogoutReq = {}): Promise<LogoutReply> {
    return apiClient.post<LogoutReply>('/auth/logout', data);
  }

  /**
   * 重置密码
   */
  async resetPassword(data: ResetPasswordReq): Promise<ResetPasswordReply> {
    return apiClient.post<ResetPasswordReply>('/auth/resetpassword', data);
  }

  /**
   * 修改密码
   */
  async changePassword(data: ChangePasswordReq): Promise<ChangePasswordReply> {
    return apiClient.post<ChangePasswordReply>('/auth/changepassword', data);
  }

  /**
   * 获取当前用户信息
   */
  async getMe(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  }

  /**
   * 获取当前用户信息 V2
   */
  async getMeV2(): Promise<User> {
    return apiClient.get<User>('/auth/mev2');
  }

  /**
   * 更新用户信息
   */
  async updateUser(data: Partial<User>): Promise<User> {
    return apiClient.post<User>('/auth/update-user', data);
  }

  /**
   * 获取用户仪表板
   */
  async getUserDashboard(): Promise<UserDashboardReply> {
    return apiClient.get<UserDashboardReply>('/auth/dashboard');
  }
}

// 导出单例
export const authService = new AuthService();

// 默认导出
export default authService;
