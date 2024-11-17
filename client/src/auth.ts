import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma-client"; // Adjust the path if necessary
import authConfig from "./auth.config";


export const { handlers, signIn, signOut, auth } = NextAuth({
    session:{
        strategy:"jwt"
    },
    adapter: PrismaAdapter(prisma),  // Add the Prisma adapter here
    ...authConfig
});
