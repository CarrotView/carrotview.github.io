import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 bg-card/80 backdrop-blur-sm rounded-3xl p-12 shadow-strong border border-border/50">
          <h2 className="text-4xl md:text-5xl font-bold">
            Ready to Transform Your Video Intelligence?
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join leading organizations using CarrotView to save time, ensure compliance, 
            and make data-driven decisions with AI-powered video analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-medium">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 hover:bg-muted">
              Schedule a Demo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground pt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;