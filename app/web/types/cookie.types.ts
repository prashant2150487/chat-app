// types/cookie.types.ts
export interface CookieOptions {
    maxAge?: number;
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    httpOnly?: boolean;
  }
  
  export interface TokenStorage {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  }
  
  export interface QueueItem {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }