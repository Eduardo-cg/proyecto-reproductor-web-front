export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  email: string
  roleName: 'ADMIN' | 'STANDARD'
}

export interface LoginResponse {
  token: string
  tokenType: string
  expiresIn: number
  user: UserInfo
}

export interface UserResponse {
  id: number
  username: string
  email: string
  roleName: 'ADMIN' | 'STANDARD'
}
