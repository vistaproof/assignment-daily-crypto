import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import { ApiResponse, LoginData, LoginResponse, RegisterData, User } from '../types/api';

interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

interface UpdateAvatarData {
  avatar_url: string;
}

class AuthService {
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<User> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }

    return result;
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: LoginResponse = await response.json();

    if (!response.ok) {
      throw new Error('Invalid email or password');
    }

    if (result.token) {
      localStorage.setItem('token', result.token);
    }

    return result;
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result: ApiResponse<void> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send reset instructions');
    }

    return result;
  }

  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CHANGE_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<void> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to change password');
    }

    return result;
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_PROFILE}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result: ApiResponse<User> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch user profile');
    }

    return result;
  }

  async updateAvatar(data: UpdateAvatarData): Promise<ApiResponse<User>> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.UPDATE_AVATAR}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result: ApiResponse<User> = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update avatar');
    }

    return result;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService(); 