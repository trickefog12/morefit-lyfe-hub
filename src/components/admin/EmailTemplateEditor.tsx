import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, RotateCcw, Mail, Palette } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_type: string;
  subject: string;
  heading: string;
  greeting_prefix: string;
  intro_text: string;
  body_text: string;
  cta_button_text: string;
  features_heading: string;
  feature_1: string;
  feature_2: string;
  feature_3: string;
  footer_text: string;
  signature: string;
  primary_color: string;
  background_color: string;
  text_color: string;
}

const defaultTemplate: Omit<EmailTemplate, 'id'> = {
  template_type: 'welcome',
  subject: 'Welcome to MoreFitLyfe!',
  heading: 'Welcome to MoreFitLyfe! 🎉',
  greeting_prefix: 'Hi',
  intro_text: 'Thank you for verifying your email and joining the MoreFitLyfe community! We\'re excited to have you on board.',
  body_text: 'You\'re now ready to explore our professional strength training and transformation programs designed for real results.',
  cta_button_text: 'Browse Our Programs',
  features_heading: 'What you can do now:',
  feature_1: 'Browse our training programs',
  feature_2: 'Check out our meal plans',
  feature_3: 'Start your transformation journey',
  footer_text: 'Let\'s get stronger together!',
  signature: 'Stefania & The MoreFitLyfe Team',
  primary_color: '#FF6B35',
  background_color: '#f6f9fc',
  text_color: '#333333',
};

export const EmailTemplateEditor = () => {
  const { t } = useLanguage();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_type", "welcome")
        .single();

      if (error) throw error;
      setTemplate(data as EmailTemplate);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error(t("email_template_load_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("email_templates")
        .update({
          subject: template.subject,
          heading: template.heading,
          greeting_prefix: template.greeting_prefix,
          intro_text: template.intro_text,
          body_text: template.body_text,
          cta_button_text: template.cta_button_text,
          features_heading: template.features_heading,
          feature_1: template.feature_1,
          feature_2: template.feature_2,
          feature_3: template.feature_3,
          footer_text: template.footer_text,
          signature: template.signature,
          primary_color: template.primary_color,
          background_color: template.background_color,
          text_color: template.text_color,
        })
        .eq("id", template.id);

      if (error) throw error;
      toast.success(t("email_template_saved"));
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(t("email_template_save_error"));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!template) return;
    setTemplate({
      ...template,
      ...defaultTemplate,
    });
    toast.info(t("email_template_reset"));
  };

  const updateField = (field: keyof EmailTemplate, value: string) => {
    if (!template) return;
    setTemplate({ ...template, [field]: value });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          {t("email_template_not_found")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t("email_template_editor")}
              </CardTitle>
              <CardDescription>{t("email_template_editor_desc")}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("reset_to_default")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? t("saving") : t("save_template")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="gap-2">
                <Mail className="h-4 w-4" />
                {t("content")}
              </TabsTrigger>
              <TabsTrigger value="branding" className="gap-2">
                <Palette className="h-4 w-4" />
                {t("branding")}
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                {t("preview")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="subject">{t("email_subject")}</Label>
                  <Input
                    id="subject"
                    value={template.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="heading">{t("email_heading")}</Label>
                  <Input
                    id="heading"
                    value={template.heading}
                    onChange={(e) => updateField("heading", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="greeting_prefix">{t("greeting_prefix")}</Label>
                  <Input
                    id="greeting_prefix"
                    value={template.greeting_prefix}
                    onChange={(e) => updateField("greeting_prefix", e.target.value)}
                    placeholder="Hi"
                  />
                </div>

                <div>
                  <Label htmlFor="intro_text">{t("intro_text")}</Label>
                  <Textarea
                    id="intro_text"
                    value={template.intro_text}
                    onChange={(e) => updateField("intro_text", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="body_text">{t("body_text")}</Label>
                  <Textarea
                    id="body_text"
                    value={template.body_text}
                    onChange={(e) => updateField("body_text", e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="cta_button_text">{t("cta_button_text")}</Label>
                  <Input
                    id="cta_button_text"
                    value={template.cta_button_text}
                    onChange={(e) => updateField("cta_button_text", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="features_heading">{t("features_heading")}</Label>
                  <Input
                    id="features_heading"
                    value={template.features_heading}
                    onChange={(e) => updateField("features_heading", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>{t("feature_list")}</Label>
                  <Input
                    value={template.feature_1}
                    onChange={(e) => updateField("feature_1", e.target.value)}
                    placeholder={t("feature_1_placeholder")}
                  />
                  <Input
                    value={template.feature_2}
                    onChange={(e) => updateField("feature_2", e.target.value)}
                    placeholder={t("feature_2_placeholder")}
                  />
                  <Input
                    value={template.feature_3}
                    onChange={(e) => updateField("feature_3", e.target.value)}
                    placeholder={t("feature_3_placeholder")}
                  />
                </div>

                <div>
                  <Label htmlFor="footer_text">{t("footer_text")}</Label>
                  <Textarea
                    id="footer_text"
                    value={template.footer_text}
                    onChange={(e) => updateField("footer_text", e.target.value)}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="signature">{t("signature")}</Label>
                  <Input
                    id="signature"
                    value={template.signature}
                    onChange={(e) => updateField("signature", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="primary_color">{t("primary_color")}</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      id="primary_color"
                      value={template.primary_color}
                      onChange={(e) => updateField("primary_color", e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      value={template.primary_color}
                      onChange={(e) => updateField("primary_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t("primary_color_desc")}</p>
                </div>

                <div>
                  <Label htmlFor="background_color">{t("background_color")}</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      id="background_color"
                      value={template.background_color}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      value={template.background_color}
                      onChange={(e) => updateField("background_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t("background_color_desc")}</p>
                </div>

                <div>
                  <Label htmlFor="text_color">{t("text_color")}</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      id="text_color"
                      value={template.text_color}
                      onChange={(e) => updateField("text_color", e.target.value)}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      value={template.text_color}
                      onChange={(e) => updateField("text_color", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t("text_color_desc")}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div 
                className="rounded-lg overflow-hidden border"
                style={{ backgroundColor: template.background_color }}
              >
                <div className="p-8 max-w-xl mx-auto bg-white my-6 rounded shadow-sm">
                  <h1 
                    className="text-2xl font-bold mb-6"
                    style={{ color: template.primary_color }}
                  >
                    {template.heading}
                  </h1>
                  
                  <p className="mb-4" style={{ color: template.text_color }}>
                    {template.greeting_prefix} {"John"},
                  </p>
                  
                  <p className="mb-4" style={{ color: template.text_color }}>
                    {template.intro_text}
                  </p>
                  
                  <p className="mb-6" style={{ color: template.text_color }}>
                    {template.body_text}
                  </p>
                  
                  <div className="my-6">
                    <button
                      className="w-full py-3 px-6 rounded font-bold text-white"
                      style={{ backgroundColor: template.primary_color }}
                    >
                      {template.cta_button_text}
                    </button>
                  </div>
                  
                  <p className="font-semibold mb-2" style={{ color: template.text_color }}>
                    {template.features_heading}
                  </p>
                  
                  <ul className="mb-6 ml-4" style={{ color: template.text_color }}>
                    <li>• {template.feature_1}</li>
                    <li>• {template.feature_2}</li>
                    <li>• {template.feature_3}</li>
                  </ul>
                  
                  <p className="text-sm text-gray-500 mt-6">
                    {template.footer_text}
                    <br /><br />
                    Best regards,
                    <br />
                    {template.signature}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
