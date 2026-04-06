import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode as base64Decode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: string[] = [];

  // Migrate brand_products with base64 image_url
  const { data: products } = await supabase
    .from("brand_products")
    .select("id, name, image_url")
    .like("image_url", "data:%");

  for (const product of products || []) {
    try {
      const matches = product.image_url.match(/^data:image\/(\w+);base64,(.+)$/s);
      if (!matches) { results.push(`Skip ${product.name}: no match`); continue; }
      
      const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      const bytes = base64Decode(matches[2]);
      const fileName = `product-${product.id.slice(0, 8)}-${Date.now()}.${ext}`;
      
      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(fileName, bytes, { contentType: `image/${matches[1]}`, upsert: true });
      
      if (uploadErr) { results.push(`Upload fail ${product.name}: ${uploadErr.message}`); continue; }
      
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
      
      const { error: updateErr } = await supabase
        .from("brand_products")
        .update({ image_url: urlData.publicUrl })
        .eq("id", product.id);
      
      if (updateErr) { results.push(`Update fail ${product.name}: ${updateErr.message}`); continue; }
      
      results.push(`✅ ${product.name}: migrated (${(product.image_url.length / 1024).toFixed(0)}KB → URL)`);
    } catch (e) {
      results.push(`❌ ${product.name}: ${e.message}`);
    }
  }

  // Also migrate any brands with base64 logos
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, logo_url")
    .like("logo_url", "data:%");

  for (const brand of brands || []) {
    try {
      const matches = brand.logo_url.match(/^data:image\/(\w+);base64,(.+)$/s);
      if (!matches) continue;
      
      const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      const bytes = base64Decode(matches[2]);
      const fileName = `brand-logo-${brand.id.slice(0, 8)}-${Date.now()}.${ext}`;
      
      const { error: uploadErr } = await supabase.storage
        .from("brand-logos")
        .upload(fileName, bytes, { contentType: `image/${matches[1]}`, upsert: true });
      
      if (uploadErr) continue;
      
      const { data: urlData } = supabase.storage.from("brand-logos").getPublicUrl(fileName);
      
      await supabase.from("brands").update({ logo_url: urlData.publicUrl }).eq("id", brand.id);
      results.push(`✅ Brand ${brand.name}: logo migrated`);
    } catch (e) {
      results.push(`❌ Brand ${brand.name}: ${e.message}`);
    }
  }

  return new Response(JSON.stringify({ results, productCount: products?.length || 0, brandCount: brands?.length || 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
