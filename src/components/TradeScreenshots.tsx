import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTradeScreenshots, TradeScreenshot } from "@/hooks/useTradeScreenshots";
import { Camera, Upload, Trash2, X, Image as ImageIcon } from "lucide-react";

interface TradeScreenshotsProps {
  tradeId: string;
}

export function TradeScreenshots({ tradeId }: TradeScreenshotsProps) {
  const { screenshots, isLoading, uploadScreenshot, updateScreenshot, deleteScreenshot } = useTradeScreenshots(tradeId);
  const [uploadType, setUploadType] = useState<'before' | 'after' | null>(null);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<TradeScreenshot | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const beforeScreenshots = screenshots.filter(s => s.screenshot_type === 'before');
  const afterScreenshots = screenshots.filter(s => s.screenshot_type === 'after');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadType(type);
      setDescription("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) return;
    
    await uploadScreenshot.mutateAsync({
      file: selectedFile,
      tradeId,
      screenshotType: uploadType,
      description: description || undefined,
    });
    
    resetUpload();
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadType(null);
    setDescription("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleView = (screenshot: TradeScreenshot) => {
    setViewingScreenshot(screenshot);
    setEditDescription(screenshot.description || "");
  };

  const handleSaveDescription = async () => {
    if (!viewingScreenshot) return;
    await updateScreenshot.mutateAsync({
      id: viewingScreenshot.id,
      description: editDescription,
    });
    setViewingScreenshot(null);
  };

  const handleDelete = async (screenshot: TradeScreenshot) => {
    await deleteScreenshot.mutateAsync(screenshot);
    setViewingScreenshot(null);
  };

  const ScreenshotCard = ({ screenshot }: { screenshot: TradeScreenshot }) => (
    <div 
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
      onClick={() => handleView(screenshot)}
    >
      <img 
        src={screenshot.image_url} 
        alt={screenshot.description || `${screenshot.screenshot_type} screenshot`}
        className="w-full h-24 object-cover"
      />
      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="text-xs text-foreground font-medium">View</span>
      </div>
      {screenshot.description && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/90 px-2 py-1">
          <p className="text-xs text-muted-foreground truncate">{screenshot.description}</p>
        </div>
      )}
    </div>
  );

  const UploadButton = ({ type, label }: { type: 'before' | 'after'; label: string }) => (
    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-colors">
      <div className="flex flex-col items-center justify-center pt-3 pb-3">
        <Upload className="w-5 h-5 text-muted-foreground mb-1" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <input
        ref={type === 'before' ? fileInputRef : undefined}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, type)}
      />
    </label>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Before Trade Screenshots */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Before Trade
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {beforeScreenshots.map((screenshot) => (
            <ScreenshotCard key={screenshot.id} screenshot={screenshot} />
          ))}
          <UploadButton type="before" label="Add Before" />
        </div>
      </div>

      {/* After Trade Screenshots */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          After Trade (Result)
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {afterScreenshots.map((screenshot) => (
            <ScreenshotCard key={screenshot.id} screenshot={screenshot} />
          ))}
          <UploadButton type="after" label="Add After" />
        </div>
      </div>

      {/* Upload Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => resetUpload()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add {uploadType === 'before' ? 'Before Trade' : 'After Trade'} Screenshot
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full max-h-64 object-contain bg-secondary/30"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="screenshot-desc">Description (optional)</Label>
              <Textarea
                id="screenshot-desc"
                placeholder="Describe your analysis, setup, or result..."
                className="input-field min-h-[80px] resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetUpload} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={uploadScreenshot.isPending}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {uploadScreenshot.isPending ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Screenshot Dialog */}
      <Dialog open={!!viewingScreenshot} onOpenChange={() => setViewingScreenshot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {viewingScreenshot?.screenshot_type === 'before' ? 'Before Trade' : 'After Trade'} Screenshot
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => viewingScreenshot && handleDelete(viewingScreenshot)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewingScreenshot && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={viewingScreenshot.image_url} 
                  alt={viewingScreenshot.description || "Screenshot"} 
                  className="w-full max-h-[400px] object-contain bg-secondary/30"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                placeholder="Add a description..."
                className="input-field min-h-[80px] resize-none"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleSaveDescription}
              disabled={updateScreenshot.isPending}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {updateScreenshot.isPending ? "Saving..." : "Save Description"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
