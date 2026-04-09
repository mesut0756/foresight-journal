import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Zap, TrendingUp, TrendingDown, Minus, Loader2, ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const forexPairs = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
  "EURGBP", "EURJPY", "GBPJPY", "AUDJPY", "XAUUSD", "XAGUSD",
  "GBPCHF", "EURAUD", "EURNZD", "GBPAUD", "GBPNZD", "CADJPY",
];

export default function Signals() {
  const [selectedPair, setSelectedPair] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setImageBase64(result);
      setAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      toast.error("Please upload a chart screenshot first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("trade-signals", {
        body: { imageBase64, pair: selectedPair },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysis(data.analysis);
    } catch (err: any) {
      toast.error(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setAnalysis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getSignalBadge = () => {
    if (!analysis) return null;
    const upper = analysis.toUpperCase();
    if (upper.includes("**BUY**") || upper.includes("SIGNAL: BUY") || upper.includes("RECOMMENDATION: BUY")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
          <TrendingUp className="w-4 h-4" /> BUY SIGNAL
        </span>
      );
    }
    if (upper.includes("**SELL**") || upper.includes("SIGNAL: SELL") || upper.includes("RECOMMENDATION: SELL")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-semibold text-sm">
          <TrendingDown className="w-4 h-4" /> SELL SIGNAL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 font-semibold text-sm">
        <Minus className="w-4 h-4" /> NEUTRAL
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Trade Signals</h1>
          <p className="text-muted-foreground mt-1">
            Upload a chart screenshot and let AI analyze the setup, market structure, and upcoming news.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Chart
              </CardTitle>
              <CardDescription>
                Upload a screenshot of your chart for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedPair} onValueChange={setSelectedPair}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency pair (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {forexPairs.map((pair) => (
                    <SelectItem key={pair} value={pair}>
                      {pair.substring(0, 3)}/{pair.substring(3)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />

              {!imagePreview ? (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-52 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-10 h-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Click to upload chart</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                </button>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Chart preview"
                    className="w-full rounded-xl border border-border object-contain max-h-64"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={clearImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleAnalyze}
                disabled={!imageBase64 || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing chart...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Chart
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Result */}
          <Card className={analysis ? "" : "flex items-center justify-center"}>
            {analysis ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Analysis Result</CardTitle>
                    {getSignalBadge()}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none max-h-[500px] overflow-y-auto pr-2">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No analysis yet</p>
                <p className="text-sm mt-1">Upload a chart and click Analyze to get AI signals</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
