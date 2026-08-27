import { randomBytes } from "crypto";

export function getVerificationCode(): string{
    const charset= 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'
    const bytes= randomBytes(6)
    return Array.from(bytes).map((b)=>charset[b%charset.length]).join('')
}