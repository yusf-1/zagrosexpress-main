import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Store, Package, Trash2, Edit, Loader2, ChevronRight, Folder, Copy, Upload, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { error as logError } from '@/lib/logger';

interface Category {
  id: string;
  name: string;
  name_ar: string | null;
  name_ku: string | null;
  image_url: string | null;
  parent_id: string | null;
}

interface Shop {
  id: string;
  category_id: string;
  name: string;
  name_ar: string | null;
  name_ku: string | null;
  image_url: string | null;
   note_en: string | null;
   note_ar: string | null;
   note_ku: string | null;
}

interface Product {
  id: string;
  shop_id: string | null;
  category_id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  created_at: string;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
}

interface BulkFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  isPdf: boolean;
}

export default function AdminProducts() {
  const { isAdmin } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Category form state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string | null>(null);

  // Shop form state
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopName, setShopName] = useState('');
  const [shopImage, setShopImage] = useState<File | null>(null);
  const [shopImagePreview, setShopImagePreview] = useState<string | null>(null);
   const [shopNoteEn, setShopNoteEn] = useState('');
   const [shopNoteAr, setShopNoteAr] = useState('');
   const [shopNoteKu, setShopNoteKu] = useState('');

  // Product form state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [productFilePreviews, setProductFilePreviews] = useState<{ url: string; isPdf: boolean }[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  // Remember last price
  const lastPriceRef = useRef<string>('');

  // Bulk add state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<BulkFile[]>([]);
  const [bulkName, setBulkName] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/home');
      return;
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    fetchData();
  }, [currentCategoryId, currentShopId]);

  const fetchData = async () => {
    setLoading(true);

    // If we're inside a shop, fetch products
    if (currentShopId) {
      const { data: shopData } = await supabase
        .from("shops")
        .select("*")
        .eq("id", currentShopId)
        .maybeSingle();
      setCurrentShop(shopData);

      if (shopData?.category_id) {
        const { data: catData } = await supabase
          .from("product_categories")
          .select("*")
          .eq("id", shopData.category_id)
          .maybeSingle();
        setCurrentCategory(catData);
      }

      const { data: prods } = await supabase
        .from("wholesale_products")
        .select("id, name, price, image_url, category_id, shop_id, created_at")
        .eq("shop_id", currentShopId)
        .order("created_at", { ascending: false });
      setProducts(prods || []);
      setCategories([]);
      setShops([]);
      setLoading(false);
      return;
    }

    // Fetch current category and its shops
    if (currentCategoryId) {
      const { data: catData } = await supabase
        .from("product_categories")
        .select("*")
        .eq("id", currentCategoryId)
        .maybeSingle();
      setCurrentCategory(catData);

      const { data: shopsData } = await supabase
        .from("shops")
        .select("*")
        .eq("category_id", currentCategoryId)
        .order("name");
      setShops(shopsData || []);
    } else {
      setCurrentCategory(null);
      setShops([]);
    }

    setCurrentShop(null);

    // Only show root categories (no subcategories in this flow)
    const { data: cats } = await supabase
      .from("product_categories")
      .select("*")
      .is("parent_id", null)
      .order("name");
    setCategories(cats || []);
    setProducts([]);
    setLoading(false);
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (error) {
      logError('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Category handlers
  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryImage(null);
    setCategoryImagePreview(null);
  };

  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
      setCategoryImagePreview(category.image_url);
    } else {
      resetCategoryForm();
    }
    setCategoryDialogOpen(true);
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImage(file);
      setCategoryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error(t('categoryNameRequired'));
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editingCategory?.image_url || null;

      if (categoryImage) {
        imageUrl = await uploadFile(categoryImage, 'categories');
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('product_categories')
          .update({ name: categoryName.trim(), image_url: imageUrl })
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success(t('categoryUpdated'));
      } else {
        const { error } = await supabase
          .from('product_categories')
          .insert({ name: categoryName.trim(), image_url: imageUrl, parent_id: null });
        if (error) throw error;
        toast.success(t('categoryCreated'));
      }

      setCategoryDialogOpen(false);
      resetCategoryForm();
      fetchData();
    } catch (error) {
      logError('Error saving category:', error);
      toast.error(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      // Check if category has shops
      const { data: shopsInCategory } = await supabase
        .from('shops')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (shopsInCategory && shopsInCategory.length > 0) {
        toast.error('Cannot delete category with shops. Delete all shops first.');
        return;
      }

      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('categoryDeleted'));
      fetchData();
    } catch (error) {
      logError('Error deleting category:', error);
      toast.error(t('failedToDelete'));
    }
  };

  // Shop handlers
  const resetShopForm = () => {
    setEditingShop(null);
    setShopName('');
    setShopImage(null);
    setShopImagePreview(null);
     setShopNoteEn('');
     setShopNoteAr('');
     setShopNoteKu('');
  };

  const openShopDialog = (shop?: Shop) => {
    if (shop) {
      setEditingShop(shop);
      setShopName(shop.name);
      setShopImagePreview(shop.image_url);
       setShopNoteEn(shop.note_en || '');
       setShopNoteAr(shop.note_ar || '');
       setShopNoteKu(shop.note_ku || '');
    } else {
      resetShopForm();
    }
    setShopDialogOpen(true);
  };

  const handleShopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShopImage(file);
      setShopImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveShop = async () => {
    if (!shopName.trim()) {
      toast.error(t('shopNameRequired') || 'Shop name is required');
      return;
    }
    if (!currentCategoryId) {
      toast.error('Please select a category first');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editingShop?.image_url || null;
      if (shopImage) {
        imageUrl = await uploadFile(shopImage, 'shops');
      }

      if (editingShop) {
        const { error } = await supabase
          .from('shops')
           .update({ 
             name: shopName.trim(), 
             image_url: imageUrl,
             note_en: shopNoteEn.trim() || null,
             note_ar: shopNoteAr.trim() || null,
             note_ku: shopNoteKu.trim() || null,
           })
          .eq('id', editingShop.id);
        if (error) throw error;
        toast.success(t('shopUpdated') || 'Shop updated');
      } else {
        const { error } = await supabase
          .from('shops')
           .insert({ 
             name: shopName.trim(), 
             image_url: imageUrl, 
             category_id: currentCategoryId,
             note_en: shopNoteEn.trim() || null,
             note_ar: shopNoteAr.trim() || null,
             note_ku: shopNoteKu.trim() || null,
           });
        if (error) throw error;
        toast.success(t('shopCreated') || 'Shop created');
      }

      setShopDialogOpen(false);
      resetShopForm();
      fetchData();
    } catch (error) {
      logError('Error saving shop:', error);
      toast.error(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShop = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const { error } = await supabase.from('shops').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('shopDeleted') || 'Shop deleted');
      fetchData();
    } catch (error) {
      logError('Error deleting shop:', error);
      toast.error(t('failedToDelete'));
    }
  };

  // Product handlers
  const resetProductForm = () => {
    setEditingProduct(null);
    setProductName('');
    setProductPrice(lastPriceRef.current);
    setProductFiles([]);
    setProductFilePreviews([]);
    setExistingImages([]);
  };

  const openProductDialog = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductName(product.name);
      setProductPrice(product.price?.toString() || '');

      const { data: images } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');
      setExistingImages(images || []);
      setProductFilePreviews([]);
      setProductFiles([]);
    } else {
      resetProductForm();
    }
    setProductDialogOpen(true);
  };

  const handleDuplicateProduct = async (product: Product) => {
    setEditingProduct(null);
    setProductName(product.name + ' (copy)');
    setProductPrice(product.price?.toString() || '');
    setProductFiles([]);
    setProductFilePreviews([]);
    setExistingImages([]);
    setProductDialogOpen(true);
  };

  // Bulk add handlers
  const openBulkDialog = () => {
    setBulkFiles([]);
    setBulkName('');
    setBulkPrice(lastPriceRef.current);
    setBulkDialogOpen(true);
  };

  const makeBulkId = () =>
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? (globalThis.crypto as Crypto).randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const getUniqueBulkName = (baseName: string, taken: Set<string>) => {
    const cleaned = baseName.trim() || "Product";
    if (!taken.has(cleaned)) return cleaned;
    let i = 2;
    while (taken.has(`${cleaned} ${i}`)) i++;
    return `${cleaned} ${i}`;
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const taken = new Set(bulkFiles.map((b) => b.name.trim()).filter(Boolean));

    const newFiles: BulkFile[] = files.map((file) => {
      const base = file.name.replace(/\.[^/.]+$/, "");
      const uniqueName = getUniqueBulkName(base, taken);
      taken.add(uniqueName);
      const isPdf = file.type === 'application/pdf';
      const preview = isPdf ? '' : URL.createObjectURL(file);
      return { id: makeBulkId(), file, preview, name: uniqueName, isPdf };
    });

    setBulkFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeBulkFile = (id: string) => {
    setBulkFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateBulkFileName = (id: string, newName: string) => {
    setBulkFiles((prev) => prev.map((f) => (f.id === id ? { ...f, name: newName } : f)));
  };

  const handleBulkSave = async () => {
    if (!currentShopId || bulkFiles.length === 0) {
      toast.error(t('bulkSelectImages'));
      return;
    }

    setBulkSaving(true);
    try {
      if (bulkPrice) lastPriceRef.current = bulkPrice;

      let successCount = 0;

      for (const f of bulkFiles) {
        const fileUrl = await uploadFile(f.file, 'products');
        const productName = bulkName.trim() || f.name?.trim() || 'Product';
        // PDFs don't need price
        const price = f.isPdf ? null : (bulkPrice ? parseFloat(bulkPrice) : null);

        const { error } = await supabase.from('wholesale_products').insert({
          category_id: currentShop?.category_id || currentCategoryId,
          shop_id: currentShopId,
          name: productName,
          price: price,
          image_url: fileUrl,
        });

        if (!error) successCount++;
      }

      toast.success(t('bulkProductsCreated').replace('{count}', successCount.toString()));
      setBulkDialogOpen(false);
      setBulkFiles([]);
      fetchData();
    } catch (error) {
      logError('Error in bulk save:', error);
      toast.error('Failed to create products');
    } finally {
      setBulkSaving(false);
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setProductFiles(prev => [...prev, ...files]);
      const previews = files.map(file => ({
        url: file.type === 'application/pdf' ? '' : URL.createObjectURL(file),
        isPdf: file.type === 'application/pdf'
      }));
      setProductFilePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeNewImage = (index: number) => {
    setProductFiles(prev => prev.filter((_, i) => i !== index));
    setProductFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    const { error } = await supabase.from('product_images').delete().eq('id', imageId);
    if (!error) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    }
  };

  const handleSaveProduct = async () => {
    if (!productName.trim() || !currentShopId) {
      toast.error(t('productNameRequired'));
      return;
    }

    setSaving(true);
    try {
      let productId = editingProduct?.id;

      let mainImageUrl = editingProduct?.image_url || null;
      if (productFiles.length > 0) {
        mainImageUrl = await uploadFile(productFiles[0], 'products');
      } else if (existingImages.length > 0) {
        mainImageUrl = existingImages[0].image_url;
      }

      const productData = {
        category_id: currentShop?.category_id || currentCategoryId,
        shop_id: currentShopId,
        name: productName.trim(),
        price: productPrice ? parseFloat(productPrice) : null,
        image_url: mainImageUrl,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('wholesale_products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('wholesale_products')
          .insert(productData)
          .select('id')
          .single();
        if (error) throw error;
        productId = data.id;
      }

      if (productId && productFiles.length > 0) {
        const startOrder = existingImages.length;
        for (let i = 0; i < productFiles.length; i++) {
          const fileUrl = await uploadFile(productFiles[i], 'products');
          if (fileUrl) {
            await supabase.from('product_images').insert({
              product_id: productId,
              image_url: fileUrl,
              display_order: startOrder + i,
            });
          }
        }
      }

      if (productPrice && !editingProduct) lastPriceRef.current = productPrice;

      toast.success(editingProduct ? t('productUpdated') : t('productCreated'));
      setProductDialogOpen(false);
      resetProductForm();
      fetchData();
    } catch (error) {
      logError('Error saving product:', error);
      toast.error(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const { error } = await supabase.from('wholesale_products').delete().eq('id', id);
      if (error) throw error;
      toast.success(t('productDeleted'));
      fetchData();
    } catch (error) {
      logError('Error deleting product:', error);
      toast.error(t('failedToDelete'));
    }
  };

  const goBack = () => {
    if (currentShopId) {
      setCurrentShopId(null);
      if (currentShop?.category_id) {
        setCurrentCategoryId(currentShop.category_id);
      }
      return;
    }
    if (currentCategoryId) {
      setCurrentCategoryId(null);
    } else {
      navigate('/admin');
    }
  };

  if (loading && !categories.length && !shops.length && !products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Back button for internal product navigation */}
        {(currentCategoryId || currentShopId) && (
          <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
            <ArrowLeft className={`w-4 h-4 mr-2 ${isRTL ? 'rotate-180' : ''}`} />
            {t('back')}
          </Button>
        )}
        {/* Breadcrumbs */}
        {(currentCategory || currentShop) && (
          <div className="flex items-center gap-1 mb-4 text-sm flex-wrap">
            <button onClick={() => { setCurrentShopId(null); setCurrentCategoryId(null); }} className="text-primary hover:underline">
              {t('categories')}
            </button>
            {currentCategory && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => { setCurrentShopId(null); setCurrentCategoryId(currentCategory.id); }}
                  className={!currentShop ? "text-foreground font-medium" : "text-primary hover:underline"}
                >
                  {currentCategory.name}
                </button>
              </>
            )}
            {currentShop && (
              <span className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{currentShop.name}</span>
              </span>
            )}
          </div>
        )}

        {/* Categories Section - Show only at root level */}
        {!currentCategoryId && !currentShopId && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  {t('categories')}
                </CardTitle>
                <Button onClick={() => openCategoryDialog()} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('add')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t('noCategories')}</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer"
                      onClick={() => setCurrentCategoryId(category.id)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-background flex-shrink-0 overflow-hidden">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => openCategoryDialog(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Shops Section - Show when inside a category but not in a shop */}
        {currentCategoryId && !currentShopId && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {t('shops') || 'Shops'}
                </CardTitle>
                <Button onClick={() => openShopDialog()} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  {t('add')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {shops.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t('noShops') || 'No shops yet'}</p>
              ) : (
                <div className="space-y-2">
                  {shops.map((shop) => (
                    <div 
                      key={shop.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer"
                      onClick={() => setCurrentShopId(shop.id)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-background flex-shrink-0 overflow-hidden">
                        {shop.image_url ? (
                          <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{shop.name}</p>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => openShopDialog(shop)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShop(shop.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Products Section (only when inside a shop) */}
        {currentShopId && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('products')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button onClick={openBulkDialog} size="sm" variant="outline">
                    <Upload className="w-4 h-4 mr-1" />
                    {t('bulkAdd')}
                  </Button>
                  <Button onClick={() => openProductDialog()} size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    {t('add')}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">{t('noProducts')}</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="w-12 h-12 rounded-lg bg-background flex-shrink-0 overflow-hidden">
                        {product.image_url?.endsWith('.pdf') ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                        ) : product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          {product.price ? (
                            <span className="font-bold text-primary">¥{product.price}</span>
                          ) : (
                            <span className="text-muted-foreground">{t('noPriceSet') || 'No price'}</span>
                          )}
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(product.created_at), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicateProduct(product)} title={t('duplicate')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openProductDialog(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="e.g., Women Clothes" />
            </div>
            <div>
              <Label>Image (optional)</Label>
              <Input type="file" accept="image/*" onChange={handleCategoryImageChange} />
              {categoryImagePreview && (
                <img src={categoryImagePreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveCategory} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shop Dialog */}
      <Dialog open={shopDialogOpen} onOpenChange={setShopDialogOpen}>
         <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingShop ? (t('editShop') || 'Edit Shop') : (t('addShop') || 'Add Shop')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('shopName') || 'Shop Name'} *</Label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="e.g., Nike Store" />
            </div>
            <div>
              <Label>{t('image') || 'Image'} ({t('optional') || 'optional'})</Label>
              <Input type="file" accept="image/*" onChange={handleShopImageChange} />
              {shopImagePreview && (
                <img src={shopImagePreview} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
             
             {/* Shop Notes - Multilingual */}
             <div className="border-t border-border pt-4">
               <Label className="text-base font-medium">{t('shopNote') || 'Shop Note'} ({t('optional') || 'optional'})</Label>
               <p className="text-xs text-muted-foreground mb-3">{t('shopNoteHint') || 'Displayed at the top of the shop page for customers'}</p>
               
               <div className="space-y-3">
                 <div>
                   <Label className="text-xs">English</Label>
                   <Input 
                     value={shopNoteEn} 
                     onChange={(e) => setShopNoteEn(e.target.value)} 
                     placeholder="Note in English..."
                   />
                 </div>
                 <div>
                   <Label className="text-xs">العربية (Arabic)</Label>
                   <Input 
                     value={shopNoteAr} 
                     onChange={(e) => setShopNoteAr(e.target.value)} 
                     placeholder="ملاحظة بالعربية..."
                     dir="rtl"
                   />
                 </div>
                 <div>
                   <Label className="text-xs">کوردی (Kurdish)</Label>
                   <Input 
                     value={shopNoteKu} 
                     onChange={(e) => setShopNoteKu(e.target.value)} 
                     placeholder="تێبینی بە کوردی..."
                     dir="rtl"
                   />
                 </div>
               </div>
             </div>
             
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShopDialogOpen(false)}>{t('cancel') || 'Cancel'}</Button>
              <Button onClick={handleSaveShop} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingShop ? (t('update') || 'Update') : (t('create') || 'Create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name" />
            </div>
            <div>
              <Label>Price (¥ Chinese Yuan) - Optional for PDFs</Label>
              <Input type="number" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="0.00" />
              {productPrice && <p className="text-xs text-muted-foreground mt-1">Customer will see: ${(parseFloat(productPrice) / 7).toFixed(2)}</p>}
            </div>
            <div>
              <Label>Files (images or PDF)</Label>
              <Input type="file" accept="image/*,.pdf" multiple onChange={handleProductFileChange} />

              {existingImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Current files:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative">
                        {img.image_url.endsWith('.pdf') ? (
                          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                        ) : (
                          <img src={img.image_url} alt="Product" className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {productFilePreviews.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">New files to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {productFilePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        {preview.isPdf ? (
                          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-primary" />
                          </div>
                        ) : (
                          <img src={preview.url} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveProduct} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Add Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('bulkAddProducts')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('sharedName')}</Label>
              <Input
                value={bulkName}
                onChange={(e) => setBulkName(e.target.value)}
                placeholder="Enter name for all products"
              />
              <p className="text-xs text-muted-foreground mt-1">All products will have this name</p>
            </div>
            <div>
              <Label>{t('sharedPrice')} (¥ Chinese Yuan) - Optional for PDFs</Label>
              <Input
                type="number"
                step="0.01"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="0.00"
              />
              {bulkPrice && <p className="text-xs text-muted-foreground mt-1">Customer will see: ${(parseFloat(bulkPrice) / 7).toFixed(2)}</p>}
            </div>

            <div>
              <Label>{t('selectFiles') || 'Select Files'}</Label>
              <Input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleBulkFileChange}
              />
              <p className="text-xs text-muted-foreground mt-1">{t('bulkFileHint') || 'Select multiple images or PDFs. PDFs will have no price.'}</p>
            </div>

            {bulkFiles.length > 0 && (
              <div className="space-y-2">
                <Label>{t('productsToCreate')} ({bulkFiles.length})</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {bulkFiles.map((f) => (
                    <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      {f.isPdf ? (
                        <div className="w-12 h-12 bg-background rounded flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                      ) : (
                        <img src={f.preview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                      )}
                      <Input
                        value={f.name}
                        onChange={(e) => updateBulkFileName(f.id, e.target.value)}
                        className="flex-1"
                        placeholder="Product name"
                      />
                      {f.isPdf && <span className="text-xs text-muted-foreground">PDF</span>}
                      <Button variant="ghost" size="icon" onClick={() => removeBulkFile(f.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleBulkSave} disabled={bulkSaving || bulkFiles.length === 0 || !currentShopId}>
                {bulkSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {t('createAll')} ({bulkFiles.length})
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}