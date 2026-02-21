import crypto from 'crypto';

export const generateCompanyCode = () => `CMP-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
export const generateJoinCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();
export const generateInviteToken = () => crypto.randomUUID();
