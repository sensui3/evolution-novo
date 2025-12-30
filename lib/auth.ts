
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_NEON_AUTH_URL,
    fetchOptions: {
        credentials: "include",
        headers: {
            "x-better-auth-project-id": import.meta.env.VITE_NEON_PROJECT_ID,
            "x-neon-project-id": import.meta.env.VITE_NEON_PROJECT_ID
        }
    }
});

export const { signIn, signUp, signOut, useSession } = authClient;
