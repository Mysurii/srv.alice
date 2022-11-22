import type { User } from './../models/user.model';
import { sign } from 'jsonwebtoken';
import { env_variables } from '../config';

type TokensPayload = Pick<User, '_id' | 'role'>;
type TokenPayload = 'rt' | 'at';

export function createAccessToken(account: TokensPayload): string {
  return createToken(account, env_variables.TOKENS.atExpiration, 'at');
}

export function createRefreshToken(account: TokensPayload): string {
  return createToken(account, env_variables.TOKENS.rtExpiration, 'rt');
}

function createToken(account: TokensPayload, expiration: number | string, type: TokenPayload): string {
  return sign({ _id: account._id, role: account.role, type }, env_variables.TOKENS.secret, { expiresIn: expiration });
}
