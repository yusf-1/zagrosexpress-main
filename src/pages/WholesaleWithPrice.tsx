import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { Info } from "lucide-react";
  import { ArrowRight, ArrowLeft, Folder, Package, Loader2, MessageCircle, Store, Calendar, LogOut } from "lucide-react";
 import { format } from "date-fns";
 import { ProductDetailModal } from "@/components/wholesale/ProductDetailModal";
  import { toast } from "sonner";
import { error as logError } from "@/lib/logger";

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
 
interface ProductImage {
  id: string;
  image_url: string;
}

interface Product {
  id: string;
  name: string;
  price: number | null;
  image_url: string | null;
  images: ProductImage[];
  created_at: string;
}

const PRODUCTS_PER_PAGE = 10;

// Get stored session token
const getSessionToken = (): string | null => {
  return localStorage.getItem("wholesale_session_token");
};

export default function WholesaleWithPrice() {
  const navigate = useNavigate();
   const { categoryId, shopId } = useParams();
  const { t, language, isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
   const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
   const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [rmbExchangeRate, setRmbExchangeRate] = useState<number>(7);
   const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset products when category changes
    setProducts([]);
    setPage(0);
    setHasMore(true);
    validateAndFetchData();
    fetchRmbExchangeRate();
   }, [categoryId, shopId]);

  const fetchRmbExchangeRate = async () => {
    const { data } = await supabase.rpc('get_public_setting', { _key: 'rmb_exchange_rate' });
    if (data) {
      const rate = parseFloat(data);
      if (!isNaN(rate) && rate > 0) {
        setRmbExchangeRate(rate);
      }
    }
  };

  // Set up intersection observer for infinite scroll
  const lastProductRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingMore) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMoreProducts();
      }
    }, { threshold: 0.1 });
    
    if (node) observerRef.current.observe(node);
  }, [loadingMore, hasMore]);

  const validateAndFetchData = async () => {
    const token = getSessionToken();
    
    if (!token) {
      navigate("/wholesale-products");
      return;
    }
    
    // Validate session server-side
    const { data: isValid } = await supabase.rpc('validate_wholesale_session', {
      _session_token: token
    });
    
    if (!isValid) {
      localStorage.removeItem("wholesale_session_token");
      localStorage.removeItem("wholesale_authenticated");
      navigate("/wholesale-products");
      return;
    }
    
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    
     // If we're inside a shop, fetch products
     if (shopId) {
       const { data: shopData } = await supabase
         .from("shops")
         .select("*")
         .eq("id", shopId)
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
       
       setCategories([]);
       setShops([]);
       await fetchProducts(0);
       setLoading(false);
       return;
     }
     
    if (categoryId) {
      const { data: catData } = await supabase
        .from("product_categories")
        .select("*")
        .eq("id", categoryId)
        .maybeSingle();
      setCurrentCategory(catData);
       
       // Fetch shops in this category
       const { data: shopsData } = await supabase
         .from("shops")
         .select("*")
         .eq("category_id", categoryId)
         .order("name");
       setShops(shopsData || []);
    } else {
      setCurrentCategory(null);
       setShops([]);
    }
     
     setCurrentShop(null);

    let query = supabase.from("product_categories").select("*").order("name");
    if (categoryId) {
      query = query.eq("parent_id", categoryId);
    } else {
      query = query.is("parent_id", null);
    }
    const { data: catData } = await query;
    setCategories(catData || []);

     // Products are only shown inside shops now
     setProducts([]);

    setLoading(false);
  };

  const fetchProducts = async (pageNum: number) => {
     if (!shopId) return;
    
    const from = pageNum * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;
    
    const { data: prodData, error } = await supabase
      .from("wholesale_products")
      .select("id, name, price, image_url, created_at")
       .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .range(from, to);
    
    if (error || !prodData) {
      setHasMore(false);
      return;
    }
    
    // Check if we have more products
    if (prodData.length < PRODUCTS_PER_PAGE) {
      setHasMore(false);
    }
    
    // Fetch images for each product
    const productsWithImages: Product[] = [];
    for (const prod of prodData) {
      const { data: images } = await supabase
        .from("product_images")
        .select("id, image_url")
        .eq("product_id", prod.id)
        .order("display_order");
      
      productsWithImages.push({
        ...prod,
        images: images || [],
      });
    }
    
    if (pageNum === 0) {
      setProducts(productsWithImages);
    } else {
      setProducts(prev => [...prev, ...productsWithImages]);
    }
    
    setPage(pageNum);
  };

  const loadMoreProducts = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    await fetchProducts(page + 1);
    setLoadingMore(false);
  };

  const getCategoryName = (cat: Category) => {
    if (language === "ar" && cat.name_ar) return cat.name_ar;
    if (language === "ku" && cat.name_ku) return cat.name_ku;
    return cat.name;
  };

   const getShopName = (shop: Shop) => {
     if (language === "ar" && shop.name_ar) return shop.name_ar;
     if (language === "ku" && shop.name_ku) return shop.name_ku;
     return shop.name;
   };
 
   const getShopNote = (shop: Shop | null): string | null => {
     if (!shop) return null;
     if (language === "ar" && shop.note_ar) return shop.note_ar;
     if (language === "ku" && shop.note_ku) return shop.note_ku;
     if (shop.note_en) return shop.note_en;
     return null;
   };
 
  const goBack = () => {
     if (currentShop) {
       // Go back to category
       if (currentShop.category_id) {
         navigate(`/wholesale-products/with-price/${currentShop.category_id}`);
       } else {
         navigate("/wholesale-products/with-price");
       }
       return;
     }
    if (currentCategory?.parent_id) {
      navigate(`/wholesale-products/with-price/${currentCategory.parent_id}`);
    } else if (categoryId) {
      navigate("/wholesale-products/with-price");
    } else {
       navigate("/home");
    }
  };

  const handleLogout = async () => {
    const confirmMessage = t("confirmLogout") || "Are you sure you want to logout? You can use this password on another device after logout.";
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoggingOut(true);
    const token = getSessionToken();

    if (token) {
      const { error } = await supabase.rpc("logout_wholesale_session", {
        _session_token: token,
      });

      if (error) {
        logError("Logout error:", error);
        toast.error(t("logoutFailed") || "Logout failed. Please try again.");
        setLoggingOut(false);
        return;
      }
    }

    localStorage.removeItem("wholesale_session_token");
    localStorage.removeItem("wholesale_authenticated");

    toast.success(t("loggedOutSuccessfully") || "Logged out successfully. You can now use this password on another device.");
    navigate("/wholesale-products");
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <BackIcon className="h-5 w-5" />
              </Button>
              <h1 className="font-semibold text-foreground">
                 {currentShop ? getShopName(currentShop) : currentCategory ? getCategoryName(currentCategory) : t("productsWithPrice")}
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("logout") || "Logout"}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {categories.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-3">{t("categories")}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <Card
                      key={category.id}
                      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md overflow-hidden"
                      onClick={() => navigate(`/wholesale-products/with-price/${category.id}`)}
                    >
                      <div className="aspect-square relative bg-secondary">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={getCategoryName(category)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-foreground text-center truncate">
                          {getCategoryName(category)}
                        </h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

             {shops.length > 0 && (
               <div className="mb-6">
                 <h2 className="text-sm font-medium text-muted-foreground mb-3">{t("shops") || "Shops"}</h2>
                 <div className="grid grid-cols-2 gap-4">
                   {shops.map((shop) => (
                     <Card
                       key={shop.id}
                       className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md overflow-hidden"
                       onClick={() => navigate(`/wholesale-products/with-price/${categoryId}/shop/${shop.id}`)}
                     >
                       <div className="aspect-square relative bg-secondary">
                         {shop.image_url ? (
                           <img
                             src={shop.image_url}
                             alt={getShopName(shop)}
                             className="w-full h-full object-cover"
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <Store className="w-12 h-12 text-muted-foreground" />
                           </div>
                         )}
                       </div>
                       <CardContent className="p-3">
                         <h3 className="font-medium text-foreground text-center truncate">
                           {getShopName(shop)}
                         </h3>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>
             )}
 
             {products.length > 0 && (
              <div>
                 {/* Shop Note Banner */}
                 {currentShop && getShopNote(currentShop) && (
                   <Alert className="mb-4 border-primary/30 bg-primary/5">
                     <Info className="h-4 w-4 text-primary" />
                     <AlertDescription className="text-foreground">
                       {getShopNote(currentShop)}
                     </AlertDescription>
                   </Alert>
                 )}
                 
                <h2 className="text-sm font-medium text-muted-foreground mb-3">{t("products")}</h2>
                 <div className="grid grid-cols-2 gap-3">
                  {products.map((product, index) => {
                     const mainImage = product.images.length > 0 
                       ? product.images[0].image_url
                       : product.image_url;
                    
                    const isLastProduct = index === products.length - 1;
                    
                    return (
                      <Card 
                        key={product.id} 
                         className="overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
                        ref={isLastProduct ? lastProductRef : null}
                         onClick={() => setSelectedProduct(product)}
                      >
                         {/* Product Image */}
                         <div className="aspect-square bg-secondary">
                           {mainImage ? (
                             <img
                               src={mainImage}
                               alt={product.name}
                               className="w-full h-full object-cover"
                               loading="lazy"
                             />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <Package className="w-10 h-10 text-muted-foreground" />
                             </div>
                           )}
                         </div>
                         
                         {/* Product Info */}
                         <CardContent className="p-3 flex flex-col flex-1">
                           <h3 className="font-medium text-foreground text-sm line-clamp-2 mb-2">
                             {product.name}
                           </h3>
                           
                           {product.price !== null ? (
                             <div className="mt-auto text-sm font-bold text-foreground">
                               ${(product.price / rmbExchangeRate).toFixed(2)} <span className="text-muted-foreground font-normal">/ ¥{product.price}</span>
                             </div>
                           ) : (
                             <a 
                               href={`https://wa.me/9647507679797?text=${encodeURIComponent(`Hello, I'm interested in this product:\n\nProduct: ${product.name}\n\nPlease let me know the price.`)}`}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="mt-auto inline-flex items-center justify-center gap-1.5 w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium rounded-md transition-colors"
                               onClick={(e) => e.stopPropagation()}
                             >
                               <MessageCircle className="w-3.5 h-3.5" />
                               {t("askForPrice")}
                             </a>
                           )}
                           
                           {product.created_at && (
                             <div className="flex items-center gap-1 text-muted-foreground text-xs mt-2">
                               <Calendar className="w-3 h-3" />
                               {format(new Date(product.created_at), "dd/MM/yyyy")}
                          </div>
                           )}
                         </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Loading more indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                
                {/* End of products indicator */}
                {!hasMore && products.length > 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">{t("noMoreProducts")}</p>
                  </div>
                )}
              </div>
            )}

             {categories.length === 0 && shops.length === 0 && products.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("noProductsYet")}</p>
              </div>
            )}
          </>
        )}
      </main>
       
       {/* Product Detail Modal */}
       <ProductDetailModal
         product={selectedProduct}
         open={selectedProduct !== null}
         onClose={() => setSelectedProduct(null)}
         rmbExchangeRate={rmbExchangeRate}
       />
    </div>
  );
}