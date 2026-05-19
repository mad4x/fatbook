import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const googleClientId = process.env.AUTH_GOOGLE_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET

if (!googleClientId || !googleClientSecret) {
    throw new Error("Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET")
}

export const { handlers,    } = NextAuth({
    providers: [
        Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
        }),
    ],
    secret: process.env.AUTH_SECRET,
    trustHost: true,
})