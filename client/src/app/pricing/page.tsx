/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Switch } from "@/components/ui/switch"

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false)

  const toggleBilling = () => setIsAnnual(!isAnnual)

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small projects and personal websites",
      features: [
        "3 deployments per month",
        "500MB storage",
        "Automatic HTTPS",
        "Community support",
        "Basic analytics",
      ],
    },
    {
      name: "Pro",
      price: isAnnual ? 49 : 59,
      description: "Ideal for growing businesses and larger applications",
      features: [
        "Unlimited deployments",
        "10GB storage",
        "Custom domain support",
        "SSL certificates",
        "24/7 priority support",
        "Automatic scaling",
        "Team collaboration",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Tailored solutions for large-scale applications",
      features: [
        "Unlimited deployments",
        "Unlimited storage",
        "Custom domain support",
        "SSL certificates",
        "24/7 dedicated support",
        "Automatic scaling",
        "Team collaboration",
        "Custom integrations",
        "SLA guarantees",
      ],
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
   

      <main className="flex-grow">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Simple, Transparent Pricing</h1>
            <p className="text-xl text-center mb-12 text-muted-foreground">Choose the plan that's right for your project</p>
            
            <div className="flex justify-center items-center space-x-4 mb-12">
              <span className={isAnnual ? "text-muted-foreground" : "font-semibold"}>Monthly</span>
              <Switch checked={isAnnual} onCheckedChange={toggleBilling} />
              <span className={isAnnual ? "font-semibold" : "text-muted-foreground"}>Annual (Save 20%)</span>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={index === 1 ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold mb-4">
                      {plan.price === "Free" ? "Free" : 
                       (typeof plan.price === 'number' ? `$${plan.price}/mo` : plan.price)}
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="h-5 w-5 text-primary mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                      {index === 0 ? "Get Started" : 
                       (index === 2 ? "Contact Sales" : "Upgrade Now")}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Not sure which plan is right for you?</h2>
            <p className="text-xl mb-8">Our team is here to help you find the perfect solution for your needs.</p>
            <Button size="lg">Contact Us</Button>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">&copy; 2023 DeployPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}