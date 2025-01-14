export interface AccountParams {
  // The two-letter country code where the account holder resides
  country: string;

  // Specifies that this is a personal account rather than a business entity
  business_type: "individual";

  // Individual's personal information
  individual: {
    first_name: string;
    last_name: string;
    email: string;
  };

  // Defines which Stripe products/features the account can access
  capabilities: {
    // Enables receiving money transfers/payouts
    transfers: { requested: boolean };
  };

  // Specifies the terms of service acceptance details
  tos_acceptance: {
    // Indicates this account accepts Stripe's Services Agreement
    service_agreement: "full";
    // Date when the account accepted the Terms of Service
    date: number;
    // IP address from which the Terms of Service were accepted
    ip: string;
  };

  // Controls various aspects of the connected account's behavior and responsibilities
  controller: {
    // Controls access to Stripe's web dashboard
    stripe_dashboard: {
      type: "none";
    };
    // Determines who pays Stripe's processing fees
    fees: {
      payer: "application";
    };
    // Defines who bears financial responsibility for disputes/chargebacks
    losses: {
      payments: "application";
    };
    // Controls how verification requirements are collected
    requirement_collection: "application";
  };

  // Default currency for the account
  default_currency: string;
}

export interface UpdateAccountParams {
  dob: {
    day: number;
    month: number;
    year: number;
  };
  address: {
    city: string;
    line1: string;
    state: string;
    postal_code?: string;
  };
}
