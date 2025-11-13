/**
 * 带认证的 Fetch 辅助函数
 * 自动添加 JWT token 到请求头
 */

/**
 * 获取认证 token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('auth_token');
}

/**
 * 带认证的 fetch
 * 自动添加 Authorization header
 */
export async function fetchWithAuth(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  // 合并 headers
  const headers = new Headers(options.headers);

  // 添加 Authorization header
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 确保有 Content-Type
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // 发起请求
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 处理 401 错误
  if (response.status === 401) {
    // 清除认证信息
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // 触发事件
      const event = new CustomEvent('auth:unauthorized');
      window.dispatchEvent(event);

      // 重定向到首页
      setTimeout(() => {
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }, 100);
    }
  }

  return response;
}

/**
 * 带认证的 GET 请求（返回 JSON）
 */
export async function getWithAuth<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  let fullUrl = url;

  // 添加查询参数
  if (params) {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const response = await fetchWithAuth(fullUrl);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 带认证的 POST 请求（返回 JSON）
 */
export async function postWithAuth<T = any>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 带认证的 PUT 请求（返回 JSON）
 */
export async function putWithAuth<T = any>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 带认证的 PATCH 请求（返回 JSON）
 */
export async function patchWithAuth<T = any>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 带认证的 DELETE 请求（返回 JSON）
 */
export async function deleteWithAuth<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
