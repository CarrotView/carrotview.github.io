import { Shield, Clock, Users, FileCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Safety & Compliance",
    description: "Automatically detect safety violations and compliance issues in real-time, ensuring your operations meet all regulatory requirements.",
  },
  {
    icon: Clock,
    title: "Time Intelligence",
    description: "Save countless hours by letting AI analyze your video footage instantly. Get insights in seconds, not days.",
  },
  {
    icon: Users,
    title: "Attendance Tracking",
    description: "Accurate, automated attendance monitoring without manual checks. Perfect for education, corporate, and event management.",
  },
  {
    icon: FileCheck,
    title: "Conflict Resolution",
    description: "Quickly review and resolve disputes with AI-powered video analysis that identifies key moments and provides objective evidence.",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful AI Solutions for Every Need
          </h2>
          <p className="text-xl text-muted-foreground">
            From compliance to conflict resolution, CarrotView's computer vision technology 
            transforms how you understand and utilize video data.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 bg-card hover:-translate-y-1"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;