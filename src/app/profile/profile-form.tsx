'use client';

import {
  createCompanyProfile,
  deleteCompanyProfile,
  updateCompanyProfile,
} from '@/app/actions/profile';
import { Button } from '@/components/ui/button';
import {
  Dialog as AlertDialog,
  DialogClose as AlertDialogCancel,
  DialogContent as AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogTrigger as AlertDialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

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

export function ProfileForm({ initialData }: { initialData: CompanyProfile | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Default empty form data
  const defaultFormData = {
    companyName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    stateCode: '',
    pincode: '',
    gstin: '',
    iecCode: '',
    pan: '',
    lutNumber: '',
    llpin: '',
    adCode: '',
    bankName: '',
    bankBranch: '',
    bankAddress: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
    ifscCode: '',
    email: '',
    phone: '',
    website: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Sync form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        district: initialData.district || '',
        state: initialData.state || '',
        stateCode: initialData.stateCode || '',
        pincode: initialData.pincode || '',
        gstin: initialData.gstin || '',
        iecCode: initialData.iecCode || '',
        pan: initialData.pan || '',
        lutNumber: initialData.lutNumber || '',
        llpin: initialData.llpin || '',
        adCode: initialData.adCode || '',
        bankName: initialData.bankName || '',
        bankBranch: initialData.bankBranch || '',
        bankAddress: initialData.bankAddress || '',
        accountName: initialData.accountName || '',
        accountNumber: initialData.accountNumber || '',
        swiftCode: initialData.swiftCode || '',
        ifscCode: initialData.ifscCode || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = initialData
        ? await updateCompanyProfile(formData)
        : await createCompanyProfile(formData);

      if (result.success) {
        router.refresh();
      } else {
        alert('Error: ' + result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCompanyProfile();
      if (result.success) {
        router.refresh();
      } else {
        alert('Error: ' + result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identity Section */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Company Identity</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Legal Name *</Label>
            <Input
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
              placeholder="Your company legal name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Address Line 1 *</Label>
              <Input
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
                placeholder="Street address"
              />
            </div>
            <div>
              <Label className="text-xs">Address Line 2</Label>
              <Input
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="h-8 text-xs mt-1"
                placeholder="Apartment, suite, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">City *</Label>
              <Input
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">District *</Label>
              <Input
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
                placeholder="e.g., Kolkata"
              />
            </div>
            <div>
              <Label className="text-xs">State *</Label>
              <Input
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
                placeholder="West Bengal"
              />
            </div>
            <div>
              <Label className="text-xs">State Code *</Label>
              <Input
                name="stateCode"
                value={formData.stateCode}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
                placeholder="19"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Pincode *</Label>
            <Input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Tax & Trade Section */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Tax & Trade Licenses</h3>
        <div className="space-y-3 grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">GSTIN (15-digit) *</Label>
            <Input
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
              placeholder="e.g., 37Aakcr3371C1ZE"
            />
          </div>
          <div>
            <Label className="text-xs">IEC (10-digit) *</Label>
            <Input
              name="iecCode"
              value={formData.iecCode}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
              placeholder="e.g., U63000BR2028PT"
            />
          </div>
          <div>
            <Label className="text-xs">PAN *</Label>
            <Input
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
              placeholder="e.g., AAKCR3371C"
            />
          </div>
          <div>
            <Label className="text-xs">AD Code (14-digit) *</Label>
            <Input
              name="adCode"
              value={formData.adCode}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">LUT Number</Label>
            <Input
              name="lutNumber"
              value={formData.lutNumber}
              onChange={handleChange}
              className="h-8 text-xs mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">LLPIN</Label>
            <Input
              name="llpin"
              value={formData.llpin}
              onChange={handleChange}
              className="h-8 text-xs mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Banking Section */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Banking & Remittance</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Bank Name *</Label>
              <Input
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Bank Branch *</Label>
              <Input
                name="bankBranch"
                value={formData.bankBranch}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Bank Address *</Label>
            <Input
              name="bankAddress"
              value={formData.bankAddress}
              onChange={handleChange}
              required
              className="h-8 text-xs mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Account Name *</Label>
              <Input
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Account Number *</Label>
              <Input
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">SWIFT Code *</Label>
              <Input
                name="swiftCode"
                value={formData.swiftCode}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">IFSC Code *</Label>
              <Input
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Section */}
      <div>
        <h3 className="font-semibold text-sm mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Email *</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Phone *</Label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-8 text-xs mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Website</Label>
            <Input
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              className="h-8 text-xs mt-1"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex justify-between gap-2 pt-4">
        <div>
          {initialData && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={isPending}
                  />
                }
              >
                Delete Profile
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Company Profile?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All company profile data will be permanently
                    deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <Button type="submit" size="sm" className="h-8 text-xs" disabled={isPending}>
          {isPending ? 'Saving...' : initialData ? 'Update Profile' : 'Create Profile'}
        </Button>
      </div>
    </form>
  );
}
