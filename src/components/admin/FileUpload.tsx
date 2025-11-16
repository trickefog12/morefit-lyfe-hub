import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [downloadToken, setDownloadToken] = useState("");
  const [productSku, setProductSku] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !downloadToken || !productSku) {
      toast({
        title: "Missing Information",
        description: "Please provide all required fields.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      // Files are stored as: {token}/{product_sku}.pdf
      const filePath = `${downloadToken}/${productSku}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from("product-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      toast({
        title: "Upload Successful",
        description: `File uploaded successfully for token: ${downloadToken}`,
      });

      // Reset form
      setFile(null);
      setDownloadToken("");
      setProductSku("");
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Product Files
        </CardTitle>
        <CardDescription>
          Upload PDF files for purchased products. Files will be associated with download tokens.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            To upload a file, you need the download token from a purchase and the product SKU.
            You can find these in the Purchase List below.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="download-token">Download Token</Label>
            <Input
              id="download-token"
              placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
              value={downloadToken}
              onChange={(e) => setDownloadToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The unique download token from the purchase record
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sku">Product SKU</Label>
            <Input
              id="product-sku"
              placeholder="e.g., strength-8week-v1"
              value={productSku}
              onChange={(e) => setProductSku(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The SKU of the product being uploaded
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">PDF File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || !downloadToken || !productSku || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>File Storage Path:</strong> {downloadToken}/{productSku}.pdf
            <br />
            Files are stored securely and can only be downloaded by users who own the corresponding purchase.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
