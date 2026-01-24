import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { ShoppingBag, Loader2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import product images
import hoodieImage from "@/assets/products/hoodie.jpg";
import teeImage from "@/assets/products/tee.jpg";
import joggersImage from "@/assets/products/joggers.jpg";
import beanieImage from "@/assets/products/beanie.jpg";

// Commissary categories
const CATEGORIES = [
  { id: "all", name: "All Gear", description: "Everything in the commissary" },
  { id: "yard-gear", name: "Yard Gear", description: "Workout apparel for training" },
  { id: "cell-block", name: "Cell Block Essentials", description: "Everyday wear for the grind" },
  { id: "trustee", name: "Trustee Collection", description: "Premium limited editions" },
  { id: "release-day", name: "Release Day Fits", description: "Dress to impress" },
];

// Map product categories to commissary categories
const getCategoryFromProduct = (productCategory: string, productName: string): string => {
  const nameLower = productName.toLowerCase();
  
  // Yard Gear - workout stuff
  if (nameLower.includes("hoodie") || nameLower.includes("jogger") || nameLower.includes("tank") || nameLower.includes("shorts")) {
    return "yard-gear";
  }
  
  // Cell Block Essentials - everyday wear
  if (nameLower.includes("tee") || nameLower.includes("t-shirt") || nameLower.includes("beanie") || nameLower.includes("cap")) {
    return "cell-block";
  }
  
  // Default based on product category
  if (productCategory === "premium" || productCategory === "limited") {
    return "trustee";
  }
  
  return "cell-block"; // Default
};

// Fallback images by product name pattern
const getProductImage = (productName: string, dbImageUrl: string | null): string => {
  if (dbImageUrl) return dbImageUrl;
  
  const nameLower = productName.toLowerCase();
  if (nameLower.includes("hoodie") || nameLower.includes("sweatshirt")) return hoodieImage;
  if (nameLower.includes("tee") || nameLower.includes("t-shirt")) return teeImage;
  if (nameLower.includes("jogger") || nameLower.includes("sweatpants")) return joggersImage;
  if (nameLower.includes("beanie") || nameLower.includes("hat")) return beanieImage;
  
  return "";
};

const Shop = () => {
  const { products, loading } = useProducts(true);
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter products by category
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => getCategoryFromProduct(p.category, p.name) === activeCategory);

  const activeDesc = CATEGORIES.find(c => c.id === activeCategory)?.description || "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-charcoal-dark relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              currentColor 10px,
              currentColor 11px
            )`
          }} />
        </div>
        
        <div className="section-container text-center relative z-10">
          <Badge variant="outline" className="border-primary text-primary mb-4">
            <ShoppingBag className="w-3 h-3 mr-1" />
            The Commissary
          </Badge>
          <h1 className="headline-hero mb-4">
            DOM <span className="text-primary">DIFFERENT</span> GEAR
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Wear your identity. Represent the mission. Official yard gear for those doing the work.
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "gold" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "transition-all",
                  activeCategory === category.id && "shadow-lg"
                )}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Category Description */}
      {activeDesc && (
        <div className="bg-charcoal py-4 border-b border-border">
          <div className="section-container">
            <p className="text-center text-muted-foreground flex items-center justify-center gap-2">
              <Filter className="w-4 h-4 text-primary" />
              {activeDesc}
            </p>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <section className="py-16 bg-background">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-display text-foreground mb-2">
                {activeCategory === "all" ? "Incoming Shipment" : "Coming Soon"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {activeCategory === "all" 
                  ? "New gear drops are on the way. Check back soon."
                  : `${CATEGORIES.find(c => c.id === activeCategory)?.name} items are being prepared.`
                }
              </p>
              {activeCategory !== "all" && (
                <Button variant="goldOutline" onClick={() => setActiveCategory("all")}>
                  View All Gear
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Category section header for filtered view */}
              {activeCategory !== "all" && (
                <div className="mb-8">
                  <h2 className="headline-section text-center">
                    {CATEGORIES.find(c => c.id === activeCategory)?.name}
                  </h2>
                  <div className="divider-gold mt-4" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const productCategory = getCategoryFromProduct(product.category, product.name);
                  
                  return (
                    <div
                      key={product.id}
                      className="group card-dark overflow-hidden hover:border-primary/50 transition-all duration-300"
                    >
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs",
                            productCategory === "yard-gear" && "bg-primary/20 text-primary",
                            productCategory === "cell-block" && "bg-blue-500/20 text-blue-400",
                            productCategory === "trustee" && "bg-purple-500/20 text-purple-400",
                            productCategory === "release-day" && "bg-emerald-500/20 text-emerald-400"
                          )}
                        >
                          {CATEGORIES.find(c => c.id === productCategory)?.name}
                        </Badge>
                      </div>

                      {/* Product Image */}
                      <div className="aspect-square bg-charcoal relative overflow-hidden">
                        {(() => {
                          const imageUrl = getProductImage(product.name, product.image_url);
                          return imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                            </div>
                          );
                        })()}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-primary text-primary-foreground px-4 py-2 font-semibold text-sm uppercase tracking-wider">
                            Coming Soon
                          </span>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4">
                        <h3 className="font-display text-lg text-foreground mb-1">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-bold text-lg">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex gap-1">
                              {product.sizes.slice(0, 4).map((size) => (
                                <span
                                  key={size}
                                  className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded"
                                >
                                  {size}
                                </span>
                              ))}
                              {product.sizes.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{product.sizes.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Commissary Info Section */}
      <section className="py-16 bg-charcoal">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="headline-section mb-4">
              Rep the <span className="text-primary">Mission</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Every piece of gear is designed for men who are doing the work. 
              Built tough. Styled with purpose. Wear your transformation.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Premium Quality", desc: "Built to last" },
                { label: "Faith-Focused", desc: "Wear your values" },
                { label: "Limited Drops", desc: "Stand out" },
                { label: "Brotherhood", desc: "Rep the crew" },
              ].map((item, i) => (
                <div key={i} className="p-4 bg-background rounded-lg border border-border">
                  <p className="font-display text-primary">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
