import type { BaseModel } from './base.model';

export type Role = 'user' | 'admin';

export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenPayload = {
  _id: BaseModel['_id'];
  role: User['role'];
  type: 'rt' | 'at';
};

export type User = BaseModel &
  LoginRequest & {
    name: string;
    role: Role;
    street: string;
    housenumber: number;
    city: string;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
