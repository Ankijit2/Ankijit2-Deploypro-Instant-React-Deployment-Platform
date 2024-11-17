"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn, UserPlus, Github, Mail } from 'lucide-react'
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { LoginSchema, SignupSchema } from '@/type'
import { z } from 'zod'
import { loginFunction } from './actions/auth-functions'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { handleGithubSignin,handleGoogleSignin,handleSignup } from './actions/auth-functions'

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const Router = useRouter()

  const loginForm = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const signupForm = useForm({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const handleLogin = async (data: z.infer<typeof LoginSchema>) => {
    const response = await loginFunction(data);
    if (response === "Login successful") {
      Router.push("/project")
    } else {
      toast.error(response as string);
    }
  };

  const handleSignupdata = async(data: { name: string; email: string; password: string }) => {
    const response = await handleSignup(data);
    if (response.error) {
      toast.error(response.message);
    } else {
      toast.success(response.message);
    }
  }




  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome to DeployPro</CardTitle>
          <CardDescription>Login or create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    rules={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
                    render={({ field,fieldState}) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="m@example.com" {...field} />
                        </FormControl>
                         <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                  
                    render={({ field,fieldState }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button className="w-full mt-6" type="submit">
                    <LogIn className="mr-2 h-4 w-4" /> Log In
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="signup">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(handleSignupdata)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field,fieldState}) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                         <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    rules={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
                    render={({ field,fieldState }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="m@example.com" {...field} />
                        </FormControl>
                         <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    rules={{ required: "Password is required", minLength: { value: 8, message: "Password must be at least 8 characters" } }}
                    render={({ field,fieldState}) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "Hide password" : "Show password"}
                              </span>
                            </Button>
                          </div>
                        </FormControl>
                         <FormMessage>{fieldState.error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                  <Button className="w-full mt-6" type="submit">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          <div className="mt-6">
            <Separator />
            <p className="text-center text-sm text-muted-foreground my-4">Or continue with</p>
            <div className="flex space-x-4">
              <form action={handleGithubSignin}>
              <Button variant="outline" className="w-full"  type='submit'>
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
              </form>
             <form action={handleGoogleSignin}>
             <Button variant="outline" className="w-full" type='submit'>
                <Mail className="mr-2 h-4 w-4" />
                Google
              </Button>
             </form>
             
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground text-center w-full">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}