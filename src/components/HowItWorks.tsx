import { Upload, Cpu, Zap } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Video",
    description: "Securely upload video footage from any source—cameras, devices, or cloud storage.",
    step: "01",
  },
  {
    icon: Cpu,
    title: "AI Analysis",
    description: "Our advanced computer vision algorithms process and analyze your video in real-time.",
    step: "02",
  },
  {
    icon: Zap,
    title: "Get Insights",
    description: "Receive actionable insights, alerts, and reports instantly—no manual review needed.",
    step: "03",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How CarrotView Works
          </h2>
          <p className="text-xl text-muted-foreground">
            Three simple steps to transform your video data into actionable intelligence
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-secondary opacity-20" 
               style={{ top: '20%' }} />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-medium">
                      <Icon className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm shadow-soft">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;