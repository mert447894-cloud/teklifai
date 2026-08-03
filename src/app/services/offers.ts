import { supabase } from "../lib/supabase";

export async function getOffers() {
  return await supabase
    .from("offers")
    .select(`
      *,
      customers (
        *
      )
    `)
    .order("created_at", {
      ascending: false,
    });
}

export async function getOffer(id: number) {
  return await supabase
    .from("offers")
    .select(`
      *,
      customers (
        *
      )
    `)
    .eq("id", id)
    .single();
}

export async function getOfferItems(offerId: number) {
  return await supabase
    .from("offer_items")
    .select("*")
    .eq("offer_id", offerId);
}