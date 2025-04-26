
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { 
  User, 
  MapPin, 
  Phone, 
  Flag, 
  Mail,
  IdCard,
  Badge,
  Edit
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  name: string;
  email: string;
  phone_number: string | null;
  aadhaar_number: string | null;
  passport_number: string | null;
  state: string | null;
  district: string | null;
}

const Profile = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone_number: '',
    aadhaar_number: '',
    passport_number: '',
    state: '',
    district: ''
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [currentUser, navigate]);

  const fetchProfile = async () => {
    if (!currentUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          aadhaar_number: data.aadhaar_number || '',
          passport_number: data.passport_number || '',
          state: data.state || '',
          district: data.district || ''
        });
      }
    } catch (error) {
      toast.error('Error fetching profile');
      console.error('Error:', error);
    }
  };

  const handleUpdate = async () => {
    if (!currentUser?.id) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: profileData.name,
          phone_number: profileData.phone_number,
          aadhaar_number: profileData.aadhaar_number,
          passport_number: profileData.passport_number,
          state: profileData.state,
          district: profileData.district
        })
        .eq('user_id', currentUser.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
      console.error('Error:', error);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                    placeholder="10 digits"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    value={profileData.aadhaar_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, aadhaar_number: e.target.value })}
                    placeholder="12 digits"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passport">Passport Number (Optional)</Label>
                  <Input
                    id="passport"
                    value={profileData.passport_number || ''}
                    onChange={(e) => setProfileData({ ...profileData, passport_number: e.target.value })}
                    placeholder="8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <select
                    id="state"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={profileData.state || ''}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={profileData.district || ''}
                    onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate}>
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{profileData.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profileData.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">{profileData.phone_number || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <IdCard className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Aadhaar Number</p>
                    <p className="font-medium">{profileData.aadhaar_number || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Passport Number</p>
                    <p className="font-medium">{profileData.passport_number || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Flag className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium">India</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{profileData.state || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{profileData.district || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
