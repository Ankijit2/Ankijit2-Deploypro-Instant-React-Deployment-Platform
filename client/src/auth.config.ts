import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./type";
import { prisma } from "./lib/prisma-client";
import { CredentialsSignin } from "next-auth";
import { NextAuthConfig } from "next-auth";
import bcryptjs from "bcryptjs";

const homeRoute = ["/","/feature","/pricing","/contact"];
const authRoute = ["/auth"];

export default {
    providers: [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        GitHub({
          clientId: process.env.GITHUB_ID!,
          clientSecret: process.env.GITHUB_SECRET!,
        }),
        Credentials({
          name: "Credentials",
          credentials: {
            email: { label: "Email", type: "text" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            const { email, password } = credentials
    
            const {data,success} = LoginSchema.safeParse({ email, password })
            if(!success) {
                throw new CredentialsSignin({cause:"Required fields missing"})
            }
                const user = await prisma.user.findUnique({
                    where: {
                        email: data.email
                    }
                })
                if (!user) {
                  throw new CredentialsSignin({cause:"Invalid credentials or user not found"})
              }

              if (!user.password) {
                  throw new CredentialsSignin({cause:"User signed up with social media"})
              }

              const isPasswordValid = await bcryptjs.compare(password as string, user.password);

              if (!isPasswordValid) {
                  throw new CredentialsSignin({cause:"Invalid credentials or user not found"})
                  
              }

              return user
    
            
          },
        }),
      ],
      pages: {
        signIn: "/auth",  // Uncomment if you have a custom sign-in page
      },
      
        
      callbacks: {
        authorized({ request: { nextUrl }, auth }) {
            const isLoggedIn = !!auth?.user;
            console.log(auth);
            console.log(isLoggedIn);
            const { pathname } = nextUrl;

            // Allow access to the home route for all users
            if (homeRoute.includes(pathname)) {
                return true;
            }

            // Redirect authenticated users away from auth routes
            if (authRoute.includes(pathname)) {
                return isLoggedIn ? Response.redirect(new URL('/project', nextUrl)) : true;
            }

            // For all other routes, require user to be logged in
            return isLoggedIn || Response.redirect(new URL('/auth', nextUrl));
        },
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id as string;
               token.picture = user.image;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.image = token.picture;
            return session;
        }
    }
} satisfies NextAuthConfig;