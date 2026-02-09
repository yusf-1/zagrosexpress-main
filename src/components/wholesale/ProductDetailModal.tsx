 import { useState } from "react";
 import { Dialog, DialogContent } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, MessageCircle, Calendar, FileText, Download, ExternalLink } from "lucide-react";
 import { useLanguage } from "@/contexts/LanguageContext";
 import { format } from "date-fns";
 
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
 
 interface ProductDetailModalProps {
   product: Product | null;
   open: boolean;
   onClose: () => void;
   rmbExchangeRate: number;
 }
 
 export function ProductDetailModal({ product, open, onClose, rmbExchangeRate }: ProductDetailModalProps) {
   const { t, isRTL } = useLanguage();
   const [currentImageIndex, setCurrentImageIndex] = useState(0);
   const [isZoomed, setIsZoomed] = useState(false);
 
   if (!product) return null;
 
   const allImages = product.images.length > 0 
     ? product.images.map(img => img.image_url)
     : product.image_url 
       ? [product.image_url] 
       : [];
 
   const hasMultipleImages = allImages.length > 1;
  const currentUrl = allImages[currentImageIndex] || '';
  const isPdf = currentUrl.toLowerCase().endsWith('.pdf');
 
   const goToPrevious = () => {
     setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
     setIsZoomed(false);
   };
 
   const goToNext = () => {
     setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
     setIsZoomed(false);
   };
 
   const toggleZoom = () => {
     setIsZoomed(!isZoomed);
   };
 
   const handleOpenChange = (isOpen: boolean) => {
     if (!isOpen) {
       setCurrentImageIndex(0);
       setIsZoomed(false);
       onClose();
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={handleOpenChange}>
       <DialogContent className="max-w-lg w-[95vw] p-0 gap-0 overflow-hidden bg-background" dir={isRTL ? "rtl" : "ltr"}>
         {/* Header */}
         <div className="flex items-center justify-between p-3 border-b border-border">
           <h2 className="font-semibold text-foreground truncate flex-1 pr-2">{product.name}</h2>
           <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
             <X className="h-5 w-5" />
           </Button>
         </div>
 
         {/* Image Gallery */}
         <div className="relative bg-secondary">
           {allImages.length > 0 ? (
            isPdf ? (
              /* PDF Display */
              <div className="aspect-square flex flex-col items-center justify-center gap-4 p-6">
                <FileText className="w-20 h-20 text-primary" />
                <p className="text-foreground font-medium text-center">{product.name}</p>
                <div className="flex gap-3">
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("open") || "Open"}
                  </a>
                  <a
                    href={currentUrl}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t("download") || "Download"}
                  </a>
                </div>
              </div>
            ) : (
              /* Image Display */
              <div 
                className={`relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onClick={toggleZoom}
              >
                <div className={`overflow-auto ${isZoomed ? 'max-h-[60vh]' : ''}`}>
                  <img
                    src={currentUrl}
                    alt={product.name}
                    className={`w-full transition-transform duration-300 ${
                      isZoomed ? 'scale-150 origin-center' : 'object-contain max-h-[50vh]'
                    }`}
                  />
                </div>
                
                {/* Zoom indicator */}
                <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5">
                  {isZoomed ? (
                    <ZoomOut className="w-4 h-4 text-white" />
                  ) : (
                    <ZoomIn className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            )
           ) : (
             <div className="aspect-square flex items-center justify-center">
               <span className="text-muted-foreground">{t("noImage")}</span>
             </div>
           )}
 
           {/* Navigation arrows */}
           {hasMultipleImages && !isZoomed && (
             <>
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                 onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
               >
                 <ChevronLeft className="h-6 w-6" />
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                 onClick={(e) => { e.stopPropagation(); goToNext(); }}
               >
                 <ChevronRight className="h-6 w-6" />
               </Button>
             </>
           )}
 
           {/* Image counter */}
           {hasMultipleImages && (
             <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
               {currentImageIndex + 1} / {allImages.length}
             </div>
           )}
         </div>
 
         {/* Thumbnail strip */}
         {hasMultipleImages && (
           <div className="flex gap-1.5 p-2 overflow-x-auto bg-muted/50">
             {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setCurrentImageIndex(idx); setIsZoomed(false); }}
                className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors ${
                  idx === currentImageIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                {img.toLowerCase().endsWith('.pdf') ? (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                ) : (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                )}
              </button>
             ))}
           </div>
         )}
 
         {/* Product Info */}
         <div className="p-4 space-y-3">
           {product.price !== null ? (
            <div className="text-2xl font-bold text-foreground">
              ${(product.price / rmbExchangeRate).toFixed(2)} <span className="text-lg text-muted-foreground font-normal">/ ¥{product.price}</span>
             </div>
           ) : (
             <a 
               href={`https://wa.me/9647507679797?text=${encodeURIComponent(`Hello, I'm interested in this product:\n\nProduct: ${product.name}\n\nPlease let me know the price.`)}`}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
             >
               <MessageCircle className="w-5 h-5" />
               {t("askForPrice")}
             </a>
           )}
           
           {product.created_at && (
             <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
               <Calendar className="w-4 h-4" />
               {format(new Date(product.created_at), "dd/MM/yyyy")}
             </div>
           )}
         </div>
       </DialogContent>
     </Dialog>
   );
 }