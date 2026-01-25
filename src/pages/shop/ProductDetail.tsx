import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Minus, Plus, Check, Loader2, AlertCircle, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Import product images - Yard Gear
import redeemedTee from "@/assets/products/redeemed-tee.jpg";
import lockdownHoodie from "@/assets/products/lockdown-hoodie.jpg";
import yardJoggers from "@/assets/products/yard-joggers.jpg";
import resistanceBands from "@/assets/products/resistance-bands.jpg";
import speedRope from "@/assets/products/speed-rope.jpg";
import gripTrainer from "@/assets/products/grip-trainer.jpg";
import workoutTimer from "@/assets/products/workout-timer.jpg";

// Import product images - Cell Block Essentials
import faithBeanie from "@/assets/products/faith-beanie.jpg";
import redeemedBottle from "@/assets/products/redeemed-bottle.jpg";

// Import product images - Chapel Store
import warriorBible from "@/assets/products/warrior-bible.jpg";
import warriorRosary from "@/assets/products/warrior-rosary.jpg";
import scriptureCards from "@/assets/products/scripture-cards.jpg";
import prayerJournal from "@/assets/products/prayer-journal.jpg";
import devotional90 from "@/assets/products/devotional-90.jpg";

// Import product images - Release Day Fits
import releasePolo from "@/assets/products/release-polo.jpg";
import releaseChinos from "@/assets/products/release-chinos.jpg";

// Image map for products (synced with Shop.tsx)
const productImageMap: Record<string, string> = {
  "disciple tee": redeemedTee,
  "iron mind heavyweight hoodie": lockdownHoodie,
  "prison discipline joggers": yardJoggers,
  "resistance band set": resistanceBands,
  "speed jump rope": speedRope,
  "grip strengthener set": gripTrainer,
  "workout timer": workoutTimer,
  "remnant beanie": faithBeanie,
  "dom different water bottle": redeemedBottle,
  "prison bible (esv)": warriorBible,
  "warrior's rosary": warriorRosary,
  "scripture memory cards": scriptureCards,
  "prayer journal": prayerJournal,
  "90-day faith devotional": devotional90,
  "release day polo": releasePolo,
  "release day chinos": releaseChinos,
};

const getProductImage = (productName: string, dbImageUrl: string | null): string => {
  const mappedImage = productImageMap[productName.toLowerCase()];
  if (mappedImage) return mappedImage;
  if (dbImageUrl) return dbImageUrl;
  
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("hoodie") || nameLower.includes("sweatshirt")) return lockdownHoodie;
  if (nameLower.includes("tee") || nameLower.includes("t-shirt")) return redeemedTee;
  if (nameLower.includes("jogger") || nameLower.includes("sweatpants")) return yardJoggers;
  if (nameLower.includes("beanie") || nameLower.includes("hat")) return faithBeanie;
  if (nameLower.includes("bible")) return warriorBible;
  if (nameLower.includes("rosary")) return warriorRosary;
  if (nameLower.includes("journal") || nameLower.includes("prayer")) return prayerJournal;
  
  return "";
};

// Generate gallery images from main image (simulated angles)
const getProductGalleryImages = (product: Product): string[] => {
  const mainImage = getProductImage(product.name, product.image_url);
  
  // If product has images array from DB, use those
  if (product.images && product.images.length > 0) {
    return [mainImage, ...product.images].filter(Boolean);
  }
  
  // Otherwise return just the main image (we can add more later)
  return mainImage ? [mainImage] : [];
};

// Get category from product
const getCategoryFromProduct = (productCategory: string, productName: string): string => {
  const nameLower = productName.toLowerCase();
  const catLower = productCategory?.toLowerCase() || "";
  
  if (catLower === "chapel-store" || nameLower.includes("bible") || nameLower.includes("rosary") || 
      nameLower.includes("prayer") || nameLower.includes("scripture") || nameLower.includes("devotional")) {
    return "chapel-store";
  }
  if (catLower === "yard-gear" || nameLower.includes("hoodie") || nameLower.includes("jogger") || 
      nameLower.includes("tank") || nameLower.includes("shorts") || nameLower.includes("resistance") ||
      nameLower.includes("rope") || nameLower.includes("grip") || nameLower.includes("timer")) {
    return "yard-gear";
  }
  if (catLower === "release-day" || nameLower.includes("polo") || nameLower.includes("chino") ||
      nameLower.includes("dress") || nameLower.includes("button")) {
    return "release-day";
  }
  if (catLower === "cell-block" || catLower === "essentials" || nameLower.includes("tee") || 
      nameLower.includes("t-shirt") || nameLower.includes("beanie") || nameLower.includes("cap") ||
      nameLower.includes("water bottle")) {
    return "cell-block";
  }
  return "cell-block";
};

// Image Gallery Component
const ImageGallery = ({ images, productName }: { images: string[]; productName: string }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (images.length === 0) {
    return (
      <div className="aspect-square bg-charcoal rounded-lg overflow-hidden flex items-center justify-center">
        <ShoppingBag className="w-24 h-24 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-charcoal rounded-lg overflow-hidden">
        <img
          src={images[selectedIndex]}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                selectedIndex === index 
                  ? "border-primary ring-2 ring-primary/30" 
                  : "border-border hover:border-primary/50"
              )}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Related Product Card
const RelatedProductCard = ({ product }: { product: Product }) => {
  const imageUrl = getProductImage(product.name, product.image_url);
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const handleQuickAdd = () => {
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One Size";
    addItem(product, defaultSize, 1);
    toast({
      title: "Added to cart!",
      description: `${product.name} added to your cart.`,
    });
  };
  
  return (
    <div className="group card-dark overflow-hidden hover:border-primary/50 transition-all duration-300">
      {/* Out of Stock Badge */}
      {!product.in_stock && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="destructive" className="text-xs">
            Out of Stock
          </Badge>
        </div>
      )}
      
      <Link to={`/shop/${product.id}`}>
        <div className="aspect-square bg-charcoal relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/shop/${product.id}`}>
          <h3 className="font-display text-foreground mb-1 hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-primary font-bold mb-3">${product.price.toFixed(2)}</p>
        
        {!product.in_stock ? (
          <Button variant="outline" size="sm" className="w-full opacity-50" disabled>
            Out of Stock
          </Button>
        ) : product.sizes && product.sizes.length > 1 ? (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/shop/${product.id}`}>Select Size</Link>
          </Button>
        ) : (
          <Button variant="gold" size="sm" className="w-full gap-2" onClick={handleQuickAdd}>
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, loading } = useProducts(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === productId);
  
  // Get gallery images for this product
  const galleryImages = useMemo(() => {
    return product ? getProductGalleryImages(product) : [];
  }, [product]);
  
  // Get related products (same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const productCategory = getCategoryFromProduct(product.category, product.name);
    return products
      .filter(p => 
        p.id !== product.id && 
        getCategoryFromProduct(p.category, p.name) === productCategory
      )
      .slice(0, 4);
  }, [product, products]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!product.in_stock) {
      toast({
        title: "Out of Stock",
        description: "This item is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose your size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    const size = selectedSize || "One Size";
    addItem(product, size, quantity);
    toast({
      title: "Added to cart!",
      description: `${product.name} (${size}) x${quantity}`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="section-container py-20 text-center">
          <h1 className="headline-section mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button variant="gold" asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isOutOfStock = !product.in_stock;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="section-container py-12">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Gallery */}
          <div className="relative">
            {isOutOfStock && (
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Out of Stock
                </Badge>
              </div>
            )}
            <ImageGallery images={galleryImages} productName={product.name} />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-4">
                {product.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
              {product.stock_quantity > 0 && product.stock_quantity <= 10 && product.in_stock && (
                <p className="text-sm text-amber-500 mt-2">
                  Only {product.stock_quantity} left in stock!
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="font-semibold mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={cn(
                        "px-4 py-2 border-2 rounded-md font-semibold transition-all",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-charcoal hover:border-primary/50",
                        isOutOfStock && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="font-semibold mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              variant={isOutOfStock ? "outline" : "gold"}
              size="lg"
              className={cn("w-full gap-2", isOutOfStock && "opacity-50 cursor-not-allowed")}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Out of Stock
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart - ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </Button>

            {/* Product Features */}
            <div className="border-t border-border pt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Premium heavyweight material</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Exclusive Redeemed Strength design</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                <span>Free shipping on orders over $100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-charcoal">
          <div className="section-container">
            <h2 className="headline-section text-center mb-8">
              You Might Also <span className="text-primary">Like</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
