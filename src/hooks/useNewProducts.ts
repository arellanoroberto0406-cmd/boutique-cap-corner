import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const LAST_VISIT_KEY = "boutique_last_visit";

export const useNewProducts = () => {
  const [newProductsCount, setNewProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkNewProducts = async () => {
      try {
        const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
        const lastVisitDate = lastVisit ? new Date(lastVisit) : new Date(0);

        // Query brand_products created after last visit
        const { count: brandProductsCount } = await supabase
          .from("brand_products")
          .select("*", { count: "exact", head: true })
          .gt("created_at", lastVisitDate.toISOString());

        // Query estuches created after last visit
        const { count: estuchesCount } = await supabase
          .from("estuches")
          .select("*", { count: "exact", head: true })
          .gt("created_at", lastVisitDate.toISOString());

        // Query pines created after last visit
        const { count: pinesCount } = await supabase
          .from("pines")
          .select("*", { count: "exact", head: true })
          .gt("created_at", lastVisitDate.toISOString());

        const totalNew = (brandProductsCount || 0) + (estuchesCount || 0) + (pinesCount || 0);
        setNewProductsCount(totalNew);
      } catch (error) {
        console.error("Error checking new products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkNewProducts();
  }, []);

  const markAsVisited = () => {
    localStorage.setItem(LAST_VISIT_KEY, new Date().toISOString());
    setNewProductsCount(0);
  };

  const clearBadge = () => {
    setNewProductsCount(0);
  };

  return { newProductsCount, isLoading, markAsVisited, clearBadge };
};
