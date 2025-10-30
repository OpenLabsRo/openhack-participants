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
  teamID?: string;
  firstName: string;
  lastName: string;
  name?: string;
  password?: string; // Not always present in API responses
  checkedIn?: boolean;
  consumables?: Consumables;
  dob?: string;
  foodRestrictions?: string;
  medicalConditions?: string;
  phoneNumber?: string;
  present?: boolean;
  university?: string;
}
