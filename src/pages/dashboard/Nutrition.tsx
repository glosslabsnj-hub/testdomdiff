import { Link } from "react-router-dom";
import { ArrowLeft, Utensils, ShoppingCart, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";

const Nutrition = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="section-container py-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="headline-section mb-2">
            Nutrition <span className="text-primary">Templates</span>
          </h1>
          <p className="text-muted-foreground">
            Simple, practical meal templates. No complicated macros unless you want them.
          </p>
        </div>

        <div className="bg-charcoal p-6 rounded-lg border border-primary/30 mb-8">
          <p className="text-sm text-primary uppercase tracking-wider mb-2">Template Notice</p>
          <p className="text-muted-foreground">
            These are editable nutrition templates. Dom will customize based on your 
            goals, preferences, and intake form responses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Meal Structure Builder */}
          <div className="bg-card p-8 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Utensils className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-primary uppercase tracking-wider">Meal Plan</p>
                <h2 className="headline-card">Meal Structure (Template)</h2>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { meal: "Meal 1 (Pre-Training)", time: "6:00 AM" },
                { meal: "Meal 2 (Post-Training)", time: "8:00 AM" },
                { meal: "Meal 3 (Lunch)", time: "12:00 PM" },
                { meal: "Meal 4 (Dinner)", time: "6:00 PM" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded bg-charcoal border border-dashed border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{item.meal}</span>
                    <span className="text-sm text-muted-foreground">{item.time}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded bg-background border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="p-2 rounded bg-background border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="p-2 rounded bg-background border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">Veggies</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plate Method */}
          <div className="bg-card p-8 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-6">
              <Grid className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xs text-primary uppercase tracking-wider">Simple Method</p>
                <h2 className="headline-card">Plate Method (Template)</h2>
              </div>
            </div>

            <div className="aspect-square max-w-xs mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
              <div className="absolute top-0 left-0 right-0 h-1/2 rounded-t-full border-b-2 border-primary/30 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="font-semibold text-primary">50%</p>
                  <p className="text-sm text-muted-foreground">Vegetables</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-bl-full border-r-2 border-primary/30 flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="font-semibold text-primary">25%</p>
                  <p className="text-sm text-muted-foreground">Protein</p>
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-full flex items-center justify-center">
                <div className="text-center p-4">
                  <p className="font-semibold text-primary">25%</p>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Simple visual guide for every meal. No measuring required.
            </p>
          </div>
        </div>

        {/* Grocery List Template */}
        <div className="bg-card p-8 rounded-lg border border-border mb-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <div>
              <p className="text-xs text-primary uppercase tracking-wider">Shopping</p>
              <h2 className="headline-card">Grocery List Template</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { category: "Proteins", items: ["Chicken breast", "Ground beef", "Eggs", "Fish"] },
              { category: "Carbs", items: ["Rice", "Oats", "Potatoes", "Bread"] },
              { category: "Vegetables", items: ["Broccoli", "Spinach", "Peppers", "Onions"] },
              { category: "Other", items: ["Olive oil", "Seasonings", "Nuts", "Fruit"] },
            ].map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold text-primary mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-charcoal border border-dashed border-border text-sm text-muted-foreground"
                    >
                      {item} (Template)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rules List */}
        <div className="bg-card p-8 rounded-lg border border-border">
          <h2 className="headline-card mb-6">Nutrition Rules (Template)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Eat protein with every meal",
              "Drink water before you eat",
              "No processed foods",
              "Meal prep on Sundays",
              "Don't drink your calories",
              "Eat slowly — 20 minute meals",
            ].map((rule, index) => (
              <div
                key={index}
                className="p-4 rounded bg-charcoal border border-dashed border-border"
              >
                <span className="text-primary font-bold mr-2">{index + 1}.</span>
                <span className="text-muted-foreground">{rule} (Template)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <Button variant="gold" asChild>
            <Link to="/dashboard/check-in">Go to Weekly Check-In</Link>
          </Button>
          <Button variant="goldOutline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
