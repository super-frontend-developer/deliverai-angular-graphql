import { IBusiness } from '@app/@core/models/business';

export interface IUser {
  id: string;
  name: UserName;
  email: string;
  businesses: IBusiness[];
}

export interface PhoneNumberDetails {
  number: string;
  countryCode: string;
  nationalNumber: string;
}

export interface UserName {
  given: string;
  family: string;
}
