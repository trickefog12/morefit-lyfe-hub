import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Mail, Clock, Send, MessageCircle } from "lucide-react";

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

    setIsSubmitting(true);
    // Send via mailto as fallback — no backend needed for now
    const subject = encodeURIComponent(`Μήνυμα από ${form.name}`);
    const body = encodeURIComponent(
      `Όνομα: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.location.href = `mailto:morefitlyfe@gmail.com?subject=${subject}&body=${body}`;
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast({
        title: t("contact_success_title"),
        description: t("contact_success_desc"),
      });
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t("contact_title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("contact_subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-bold mb-6">{t("contact_form_title")}</h2>
                {submitted ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
                    <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t("contact_success_title")}</h3>
                    <p className="text-muted-foreground">{t("contact_success_desc")}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium mb-1 block">
                        {t("contact_name")}
                      </label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t("contact_name_placeholder")}
                        required
                        maxLength={100}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium mb-1 block">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t("contact_email_placeholder")}
                        required
                        maxLength={255}
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="text-sm font-medium mb-1 block">
                        {t("contact_message")}
                      </label>
                      <Textarea
                        id="message"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder={t("contact_message_placeholder")}
                        required
                        maxLength={2000}
                        rows={5}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      {isSubmitting ? t("contact_sending") : t("contact_send")}
                    </Button>
                  </form>
                )}
              </div>

              {/* Info sidebar */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">{t("contact_info_title")}</h2>
                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a
                          href="mailto:morefitlyfe@gmail.com"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          morefitlyfe@gmail.com
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="rounded-full bg-primary/10 p-3">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{t("contact_response_time_label")}</h3>
                        <p className="text-muted-foreground">
                          {t("contact_response_time")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick links */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-6">
                  <h3 className="font-semibold mb-4">{t("contact_useful_links")}</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="/programs#faq" className="text-muted-foreground hover:text-primary transition-colors">
                        → {t("contact_link_faq")}
                      </a>
                    </li>
                    <li>
                      <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                        → {t("contact_link_terms")}
                      </a>
                    </li>
                    <li>
                      <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                        → {t("contact_link_privacy")}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
