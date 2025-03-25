export interface Plan {
  name: string; // for the ui
  amount: number;
  currency: string;
  interval: string; // for stripe
  isPopular?: boolean;
  description: string;
  features: string[];
}

export const availablePlans: Plan[] = [
  {
    name: "weekly plan",
    amount: 9.99,
    currency: "euro",
    interval: "week",
    description:
      "Great if you want to try the service before making the commitment to your health.",
    features: [
      "Unlimited AI meal plans",
      "AI Nutrition Insights",
      "Cancel Anytime",
    ],
  },
  {
    name: "Monthly plan",
    amount: 30,
    isPopular: true,
    currency: "euro",
    interval: "month",
    description:
      "Perfect for ongoing, month-to-month meal planning and features",
    features: [
      "Unlimited AI meal plans",
      "Priority AI support",
      "Cancel Anytime",
    ],
  },
  {
    name: "Yearly plan",
    amount: 200,
    currency: "euro",
    interval: "year",
    description: "The best commitment for your heath goals",
    features: [
      "Unlimited AI meal plans",
      "All Premium Features",
      "Cancel Anytime",
    ],
  },
];

const priceIDMap: Record<string, string> = {
  // the ! at the end is the non-null assertion type , it tells typescripty that this value will nevver be null
  week: process.env.STRIPE_PRICE_WEEKLY!,
  month: process.env.STRIPE_PRICE_MONTHLY!,
  year: process.env.STRIPE_PRICE_YEARLY!,
};
//mapping to stripe and we will use this function
export const getPriceIDFromType = (planType: string) => priceIDMap[planType];
