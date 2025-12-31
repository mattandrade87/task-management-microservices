export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export * from "./auth/login.dto";
export * from "./auth/register.dto";
export * from "./auth/refresh-token.dto";
