import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-it'
const key = new TextEncoder().encode(SECRET_KEY)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch {
        return null
    }
}

export async function hashPassword(password: string) {
    return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash)
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value
    if (!session) return null
    return await decrypt(session)
}

export async function updateSession() {
    const session = (await cookies()).get('session')?.value
    if (!session) return null

    // Refresh if needed - for now just return payload
    const parsed = await decrypt(session)
    if (!parsed) return null

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: expires,
        sameSite: 'lax',
        path: '/',
    })

    return parsed
}

export async function logout() {
    (await cookies()).set('session', '', { expires: new Date(0) })
}
