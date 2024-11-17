/* eslint-disable react/no-unescaped-entities */
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Rocket, Shield, Zap, GitBranch, BarChart } from 'lucide-react'

export default function FeaturesPage() {
  const currentFeatures = [
    {
      icon: <Rocket className="h-8 w-8 text-primary" />,
      title: "One-Click Deployments",
      description: "Deploy your React applications with a single click. Our streamlined process ensures your code goes live in seconds."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Advanced Security",
      description: "Built-in security features including SSL certificates, DDoS protection, and automated security patches."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Global CDN",
      description: "Lightning-fast content delivery with our global CDN, ensuring your users have the best experience worldwide."
    },
    {
      icon: <GitBranch className="h-8 w-8 text-primary" />,
      title: "Continuous Deployment",
      description: "Automatically deploy your changes when you push to your repository. Includes feature updates for seamless integration."
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: "Performance Analytics",
      description: "Gain insights into your application's performance with detailed analytics and monitoring tools."
    }
  ]

  const upcomingFeatures = [
    "Custom Domains",
    "A/B Testing",
    "Serverless Functions",
    "Team Collaboration Tools"
  ]

  return (
    <div className="min-h-screen flex flex-col">
    

      <main className="flex-grow">
        <section className="bg-background py-20">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">Powerful Features for Modern React Deployments</h1>
            <p className="text-xl text-center mb-12 text-muted-foreground max-w-2xl mx-auto">
              DeployPro offers a comprehensive set of features designed to streamline your React deployment process and enhance your application's performance.
            </p>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {currentFeatures.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Coming Soon</h2>
            <p className="text-xl text-center mb-12 text-muted-foreground max-w-2xl mx-auto">
              We're constantly working to improve DeployPro. Here are some exciting features on our roadmap:
            </p>
            <ul className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
              {upcomingFeatures.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Rocket className="h-5 w-5 text-primary mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Ready to experience the power of DeployPro?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of developers who trust DeployPro for their React deployment needs. Start deploying your applications with ease today.
            </p>
            <Button size="lg">Get Started for Free</Button>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">&copy; 2023 DeployPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}