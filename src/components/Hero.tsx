import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SimpleVideoUpload from "@/components/SimpleVideoUpload";
import heroImage from "@/assets/hero-image.jpg";

// Key statistics for the hero section
const heroStats = [
  { value: "95%", label: "Time Saved" },
  { value: "24/7", label: "Monitoring" }, 
  { value: "100%", label: "Accuracy" },
] as const;

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                AI-Powered Video Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Stop Watching.
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Start Knowing.
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-xl">
              CarrotView uses advanced computer vision and AI to analyze video footage instantly, 
              helping you maintain compliance, ensure safety, and resolve conflicts—without watching hours of video.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-medium">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-2 hover:bg-muted">
                Watch Demo
              </Button>
            </div>

            {/* Video Upload Section */}
            <div className="mt-12 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold mb-2">Try It Now</h3>
                <p className="text-muted-foreground">
                  Upload your video and see CarrotView's AI analysis in action
                </p>
              </div>
              <SimpleVideoUpload />
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              {heroStats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  <div>
                    <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                  {index < heroStats.length - 1 && (
                    <div className="h-12 w-px bg-border" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full" />
            <img 
              src={heroImage} 
              alt="AI Video Analysis Interface" 
              className="relative rounded-2xl shadow-strong w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;