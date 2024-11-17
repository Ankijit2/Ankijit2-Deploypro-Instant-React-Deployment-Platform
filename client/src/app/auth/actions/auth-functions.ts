"use server";
import { signIn,signOut } from "@/auth";
import { CredentialsSignin } from "next-auth"
import { LoginSchema, SignupSchema } from "@/type";
import { z } from "zod";
import { prisma } from "@/lib/prisma-client";
import bcryptjs from "bcryptjs";


export async function loginFunction(data: z.infer<typeof LoginSchema>) {
    try {
        await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false, // Prevent automatic redirection
        });


        return "Login successful";
    } catch (error) {
        if (error instanceof CredentialsSignin) {
            return error.cause;
        }
        else {
            return "Login failed";
        }
        
    }
}


export async function handleGithubSignin() {
    await signIn("github", { redirectTo: "/" });
}

export async function handleGoogleSignin() {
    await signIn("google", { redirectTo: "/" });
}


export async function handleSignOut() {
    await signOut();
}

export async function handleSignup(data: z.infer<typeof SignupSchema>) {
    const existinguser = await prisma.user.findUnique({where:{email:data.email}})
    if (existinguser) {
        return {
            error:true,
            message:"User already exists"
        }
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(data.password, salt);

    const response = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword
        }
    });
    if(!response) {
        return {
            error:true,
            message:"Signup failed"
        }
    }
    return {
        error:false,
        message:"Signup successful"
    }

}