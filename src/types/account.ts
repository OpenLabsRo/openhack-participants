export interface Consumables {
  coffee: boolean;
  jerky: boolean;
  pizza: boolean;
  sandwiches: number;
  water: number;
}

export interface Account {
  id: string;
  email: string;
  password?: string; // Not always present in API responses
  name: string;
  teamID: string;
  checkedIn?: boolean;
  consumables?: Consumables;
  dob?: string;
  foodRestrictions?: string;
  medicalConditions?: string;
  phoneNumber?: string;
  present?: boolean;
  university?: string;
}
