import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLanguage } from "@/contexts/LanguageContext";

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [downloadToken, setDownloadToken] = useState("");
  const [productSku, setProductSku] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast({
          title: t("invalid_file_type"),
          description: t("invalid_file_type_desc"),
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !downloadToken || !productSku) {
      toast({
        title: t("missing_information"),
        description: t("missing_information_desc"),
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
        title: t("upload_successful"),
        description: t("upload_successful_desc").replace("{token}", downloadToken),
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
        title: t("upload_failed"),
        description: error.message || t("upload_failed_desc"),
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
          {t("upload_product_files")}
        </CardTitle>
        <CardDescription>
          {t("upload_product_files_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("upload_info_alert")}
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="download-token">{t("download_token")}</Label>
            <Input
              id="download-token"
              placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
              value={downloadToken}
              onChange={(e) => setDownloadToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("download_token_desc")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-sku">{t("product_sku")}</Label>
            <Input
              id="product-sku"
              placeholder="e.g., strength-8week-v1"
              value={productSku}
              onChange={(e) => setProductSku(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t("product_sku_desc")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload">{t("pdf_file")}</Label>
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
            {uploading ? t("uploading") : t("upload_file")}
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>{t("file_storage_path")}</strong> {downloadToken}/{productSku}.pdf
            <br />
            {t("file_storage_info")}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};