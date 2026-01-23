import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Import product images
import hoodieImage from "@/assets/products/hoodie.jpg";
import teeImage from "@/assets/products/tee.jpg";
import joggersImage from "@/assets/products/joggers.jpg";
import beanieImage from "@/assets/products/beanie.jpg";

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-charcoal-dark">
        <div className="section-container text-center">
          <Badge variant="outline" className="border-gold text-gold mb-4">
            <ShoppingBag className="w-3 h-3 mr-1" />
            Official Gear
          </Badge>
          <h1 className="headline-hero mb-4">
            DOM <span className="text-gold">DIFFERENT</span> MERCH
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wear your identity. Represent the mission. Every piece is a reminder of who you're becoming.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-background">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-display text-foreground mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">
                New merchandise drops are on the way. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group card-dark overflow-hidden hover:border-gold/50 transition-all duration-300"
                >
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
                    <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="bg-gold text-background px-4 py-2 font-semibold text-sm uppercase tracking-wider">
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
                      <span className="text-gold font-bold text-lg">
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
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Shop;
