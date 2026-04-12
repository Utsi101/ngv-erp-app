'use server';

import { db } from '@/lib/db';

export async function getCompanyProfile() {
  try {
    const profile = await db.companyProfile.findFirst();
    return { success: true as const, data: profile };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to fetch company profile' };
  }
}

export async function createCompanyProfile(data: {
  companyName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  stateCode: string;
  pincode: string;
  gstin: string;
  iecCode: string;
  pan: string;
  lutNumber?: string;
  llpin?: string;
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
  website?: string;
}) {
  try {
    // Check if profile already exists
    const existing = await db.companyProfile.findFirst();
    if (existing) {
      return {
        success: false as const,
        error: 'Company profile already exists. Use update instead.',
      };
    }

    const profile = await db.companyProfile.create({ data });
    return { success: true as const, data: profile };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to create company profile' };
  }
}

export async function updateCompanyProfile(data: {
  companyName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district: string;
  state?: string;
  stateCode?: string;
  pincode?: string;
  gstin?: string;
  iecCode?: string;
  pan?: string;
  lutNumber?: string;
  llpin?: string;
  adCode?: string;
  bankName?: string;
  bankBranch?: string;
  bankAddress?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  ifscCode?: string;
  email?: string;
  phone?: string;
  website?: string;
}) {
  try {
    const profile = await db.companyProfile.findFirst();
    if (!profile) {
      return { success: false as const, error: 'Company profile not found. Create one first.' };
    }

    const updated = await db.companyProfile.update({
      where: { id: profile.id },
      data,
    });
    return { success: true as const, data: updated };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to update company profile' };
  }
}

export async function deleteCompanyProfile() {
  try {
    const profile = await db.companyProfile.findFirst();
    if (!profile) {
      return { success: false as const, error: 'Company profile not found' };
    }

    await db.companyProfile.delete({
      where: { id: profile.id },
    });
    return { success: true as const };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false as const, error: 'Failed to delete company profile' };
  }
}
