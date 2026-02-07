import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Loader2 } from "lucide-react";

interface UrlInputProps {
  onSubmit?: (url: string) => void;
  apiEndpoint?: string;
}

const UrlInput = ({ onSubmit, apiEndpoint = "http://127.0.0.1:8000/submit_url" }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setMessage("Please enter a URL");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const fullUrl = `${apiEndpoint}?url=${encodeURIComponent(url)}`;
      const response = await fetch(fullUrl, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      setMessage("URL submitted successfully!");
      if (onSubmit) {
        onSubmit(url);
      }
      setUrl("");
      
    } catch (error) {
      console.error("Error submitting URL:", error);
      setMessage("Failed to submit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <label className="block text-lg font-medium mb-3">
        Please put in your company's URL
      </label>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Enter a video URL (e.g., https://youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="pl-10 h-12 text-base border-2"
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          size="lg"
          className="h-12 px-8 bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
      {message && (
        <p className="text-sm mt-2 text-muted-foreground">{message}</p>
      )}
      <p className="text-sm text-muted-foreground mt-2">
        Paste any video URL and click Submit to analyze
      </p>
    </div>
  );
};

export default UrlInput;
