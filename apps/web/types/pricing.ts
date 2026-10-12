export type PricingTextAlign = 'left' | 'center' | 'right';
export interface PricingPlan {
  title: string;
  price: string;
  unit?: string;
  unitAmount?: string;
  description?: string;
  features?: string[];
  featured?: boolean;
  textAlign?: PricingTextAlign;
  actionButton?: { label: string; url: string };
}
