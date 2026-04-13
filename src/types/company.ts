/**
 * Company profile types
 */

export type CompanyProfile = {
  id: string;
  companyName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  iecCode: string;
  pan: string;
  lutNumber: string | null;
  llpin: string | null;
  adCode: string;
  bankName: string;
  bankBranch: string;
  bankAddress: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  ifscCode: string;
  email: string;
  phone: string;
  website: string | null;
  createdAt: Date;
  updatedAt: Date;
};
