import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  sku: string;
  name_en: string;
  name_el: string;
  description_en: string | null;
  description_el: string | null;
  price: number;
  category: string;
  format: string;
  active: boolean;
  image_url: string | null;
}

export const ProductManagement = () => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const { error } = await supabase
        .from('products')
        .update({
          name_en: product.name_en,
          name_el: product.name_el,
          description_en: product.description_en,
          description_el: product.description_el,
          price: product.price,
          active: product.active,
          image_url: product.image_url
        })
        .eq('sku', product.sku);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: t("product_updated") });
      setIsDialogOpen(false);
      setEditingProduct(null);
    },
    onError: () => {
      toast({ title: t("product_update_failed"), variant: "destructive" });
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ sku, active }: { sku: string; active: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ active })
        .eq('sku', sku);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: t("product_status_updated") });
    }
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingProduct) {
      updateProductMutation.mutate(editingProduct);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{t("loading_products")}</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("product_management")}</CardTitle>
          <CardDescription>{t("product_management_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products?.map((product) => (
              <Card key={product.sku}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name_en}</h3>
                      <p className="text-sm text-muted-foreground">{product.category} - {product.format}</p>
                      <p className="text-lg font-bold text-primary mt-2">${product.price}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${product.sku}`}>{t("active")}</Label>
                        <Switch
                          id={`active-${product.sku}`}
                          checked={product.active}
                          onCheckedChange={(checked) => 
                            toggleActiveMutation.mutate({ sku: product.sku, active: checked })
                          }
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("edit_product")}</DialogTitle>
            <DialogDescription>{t("edit_product_desc")}</DialogDescription>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_en">{t("name_english")}</Label>
                  <Input
                    id="name_en"
                    value={editingProduct.name_en}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name_el">{t("name_greek")}</Label>
                  <Input
                    id="name_el"
                    value={editingProduct.name_el}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name_el: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">{t("description_english")}</Label>
                <Textarea
                  id="description_en"
                  value={editingProduct.description_en || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_el">{t("description_greek")}</Label>
                <Textarea
                  id="description_el"
                  value={editingProduct.description_el || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description_el: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t("price_usd")}</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">{t("image_url")}</Label>
                <Input
                  id="image_url"
                  value={editingProduct.image_url || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button onClick={handleSave} disabled={updateProductMutation.isPending}>
                  {updateProductMutation.isPending ? t("saving") : t("save_changes")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
