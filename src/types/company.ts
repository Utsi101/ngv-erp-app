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

/** Input for creating a company profile — derived from CompanyProfile, nullable fields become optional */
export type CompanyProfileInput = Omit<
  CompanyProfile,
  'id' | 'createdAt' | 'updatedAt' | 'addressLine2' | 'lutNumber' | 'llpin' | 'website'
> & {
  addressLine2?: string;
  lutNumber?: string;
  llpin?: string;
  website?: string;
};

/** Input for updating a company profile (all fields optional except district) */
export type CompanyProfileUpdateInput = Partial<CompanyProfileInput> & {
  district: string;
};
