export type OfferItem = {
  id?: number;
  product_name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Customer = {
  id: number;
  name: string;
  company: string;
  phone?: string;
  email?: string;
};

export type Offer = {
  id?: number;
  customer_id: number;
  title: string;
  total: number;

  offer_no?: string;
  valid_until?: string;
  vat_rate?: number;
  notes?: string;

  created_at?: string;

  customers?: Customer;

  offer_items?: OfferItem[];
};