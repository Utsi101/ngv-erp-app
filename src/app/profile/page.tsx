import { getCompanyProfile } from '@/app/actions/profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/profile/profileForm';
import type { CompanyProfile } from '@/types';

export default async function ProfilePage() {
  const result = (await getCompanyProfile()) as { success: boolean; data: CompanyProfile | null };
  const profile = result.success ? result.data : null;

  return (
    <div className="p-4 max-w-7xl justify-self-center w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Company Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your company details. These will be automatically used in invoices.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {profile ? 'Edit Company Profile' : 'Create Company Profile'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm initialData={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
