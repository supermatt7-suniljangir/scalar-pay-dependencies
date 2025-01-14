// This should be an ISO 3166 - 1 alpha - 2 country code.
export enum CountryCode {
  IRELAND = "IE",
}

export enum Currency {
  EURO = "EUR",
}

interface SupportedCountry {
  code: CountryCode;
  name: string;
  currency: Currency;
}

const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  { code: CountryCode.IRELAND, name: "Ireland", currency: Currency.EURO },
];

Object.freeze(SUPPORTED_COUNTRIES);

function validateSupportedCountries(countries: SupportedCountry[]): boolean {
  const seenCountryCodes = new Set<CountryCode>();

  for (const country of countries) {
    if (seenCountryCodes.has(country.code)) {
      console.error(`Duplicate CountryCode found: ${country.code}`);
      return false;
    }
    seenCountryCodes.add(country.code);
  }

  return true;
}

// This will fail import if we have multiple countries with same `CountryCode`.
if (!validateSupportedCountries(SUPPORTED_COUNTRIES)) {
  throw new Error(
    `Duplicate CountryCode found. Countries can't have the same code.`
  );
}

/**
 * Gets the currency for a given country code
 * @param countryCode ISO 3166-1 alpha-2 country code
 * @returns The currency for the country
 * @throws Error if country is not supported
 */
export function getCurrencyForCountry(countryCode: CountryCode): Currency {
  const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);

  if (!country) {
    throw new Error(`Unsupported country code: ${countryCode}`);
  }

  return country.currency;
}

export { SUPPORTED_COUNTRIES };
