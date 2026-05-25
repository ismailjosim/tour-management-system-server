export interface CountryLocation {
  id: number;
  name: string;
}

export interface StateLocation {
  id: number;
  name: string;
  country_id: number;
}

export const COUNTRIES: CountryLocation[] = [{ id: 1, name: 'Bangladesh' }];

export const STATES: StateLocation[] = [
  { id: 1, name: 'Dhaka', country_id: 1 },
  { id: 2, name: 'Barishal', country_id: 1 },
  { id: 3, name: 'Chattogram', country_id: 1 },
  { id: 4, name: 'Khulna', country_id: 1 },
  { id: 5, name: 'Mymensingh', country_id: 1 },
  { id: 6, name: 'Rajshahi', country_id: 1 },
  { id: 7, name: 'Rangpur', country_id: 1 },
  { id: 8, name: 'Sylhet', country_id: 1 },
];

export const getAllCountries = () => COUNTRIES;

export const getStatesByCountryId = (countryId: number) =>
  STATES.filter((state) => state.country_id === countryId);

export const getStatesByCountryName = (countryName: string) => {
  const country = COUNTRIES.find(
    (item) => item.name.toLowerCase() === countryName.trim().toLowerCase()
  );

  return country ? getStatesByCountryId(country.id) : [];
};

export const DIVISION_ALIASES: Record<string, string> = {
  chittagong: 'Chattogram',
};
