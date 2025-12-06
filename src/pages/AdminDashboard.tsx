import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { PurchaseList } from "@/components/admin/PurchaseList";
import { ReviewModeration } from "@/components/admin/ReviewModeration";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { DownloadAnalytics } from "@/components/admin/DownloadAnalytics";
import { DownloadLimitManager } from "@/components/admin/DownloadLimitManager";
import { UserManagement } from "@/components/admin/UserManagement";
import { RevenueReports } from "@/components/admin/RevenueReports";
import { FileUpload } from "@/components/admin/FileUpload";
import { AuditLog } from "@/components/admin/AuditLog";
import { AdminActivityWidget } from "@/components/admin/AdminActivityWidget";
import { NotificationSettings } from "@/components/admin/NotificationSettings";
import { IPWhitelistManager } from "@/components/admin/IPWhitelistManager";
import { TwoFactorSetup } from "@/components/admin/TwoFactorSetup";
import { ShoppingBag, DollarSign, Star, Users, BarChart, Package, Upload, Settings, Shield } from "lucide-react";
import { NotificationPanel } from "@/components/admin/NotificationPanel";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t("admin_dashboard_title")}</h1>
            <p className="text-muted-foreground">{t("admin_dashboard_subtitle")}</p>
          </div>
          <NotificationPanel />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-10">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_overview")}</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_products")}</span>
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_purchases")}</span>
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_files")}</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_reviews")}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_users")}</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_revenue")}</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_downloads")}</span>
            </TabsTrigger>
            <TabsTrigger value="limits" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_limits")}</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">{t("admin_audit")}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_revenue")}</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{t("view_in_revenue_tab")}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_purchases")}</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{t("view_in_purchases_tab")}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("pending_reviews_count")}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{t("view_in_reviews_tab")}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_users")}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{t("view_in_users_tab")}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AdminActivityWidget />
              
              <Card>
                <CardHeader>
                  <CardTitle>{t("analytics_overview")}</CardTitle>
                  <CardDescription>{t("analytics_overview_desc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="purchases">
            <PurchaseList />
          </TabsContent>

          <TabsContent value="files" className="space-y-6">
            <FileUpload />
            <PurchaseList />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewModeration />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="revenue">
            <RevenueReports />
          </TabsContent>

          <TabsContent value="downloads">
            <DownloadAnalytics />
          </TabsContent>

          <TabsContent value="limits">
            <div className="space-y-6">
              <TwoFactorSetup />
              <DownloadLimitManager />
              <NotificationSettings />
              <IPWhitelistManager />
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <AuditLog />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
