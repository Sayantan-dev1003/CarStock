export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  admin: AdminProfile;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  shopName: string;
  shopPhone: string;
  logoUrl?: string;
  deviceToken?: string;
}
