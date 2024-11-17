'use client'

import {  Cloud, Zap, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



export default function Page() {



  return (
  
    

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Deploy Your Web Apps with Ease</h1>
            <p className="text-xl mb-8">Fast, secure, and scalable deployments for modern web applications</p>
            <Button size="lg" variant="secondary">Get Started</Button>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose DeployPro?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Cloud className="w-12 h-12 mb-4 text-primary mx-auto" />
                  <CardTitle className="text-center">Cloud-Native</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Built for the cloud, ensuring high availability and easy scaling
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="w-12 h-12 mb-4 text-primary mx-auto" />
                  <CardTitle className="text-center">Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Optimized for speed, delivering your apps to users in milliseconds
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Lock className="w-12 h-12 mb-4 text-primary mx-auto" />
                  <CardTitle className="text-center">Secure by Default</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Enterprise-grade security measures to protect your applications
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to Deploy?</h2>
            <p className="text-xl mb-8">Join thousands of developers who trust DeployPro for their web deployments</p>
            <Button size="lg">Sign Up Now</Button>
          </div>
        </section>
      </main>

    

  )
}