import { Link } from "react-router-dom";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";

const MerchShowcase = () => {
  const { products, loading } = useProducts(true);

  if (loading) {
    return (
      <section className="py-20 bg-charcoal">
        <div className="section-container">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  // Don't render the section if no products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-charcoal">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="bg-primary/20 text-primary border-primary/30 mb-4">
            <ShoppingBag className="h-3 w-3 mr-1" />
            Dom Different Apparel
          </Badge>
          <h2 className="headline-section mb-4">
            Wear The <span className="text-primary">Mindset</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rep the Dom Different brand. Premium apparel designed for men who refuse to be average.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-card rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Badge className="bg-primary text-primary-foreground">Coming Soon</Badge>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.sizes.length > 0 && (
                    <div className="flex gap-1">
                      {product.sizes.slice(0, 4).map((size) => (
                        <span
                          key={size}
                          className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground"
                        >
                          {size}
                        </span>
                      ))}
                      {product.sizes.length > 4 && (
                        <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
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

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-muted-foreground mb-4">
            Full store launching soon. Stay tuned.
          </p>
        </div>
      </div>
    </section>
  );
};

export default MerchShowcase;
