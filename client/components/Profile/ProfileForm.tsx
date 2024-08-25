import React, { ReactNode } from 'react';
import { Range } from 'react-range';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/components/ui/use-toast";
import { Profile, ProfileFormProps } from '@/types/profile';
import { useProfileForm } from '@/hooks/useProfileForm';
import { countries, personalityTypes, DEFAULT_MIN_AGE } from '@/utils/constants';

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSubmit }: ProfileFormProps) => {
  const { formData, handleChange, handlePreferenceChange } = useProfileForm(profile);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('bio', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              name="interests"
              value={formData.interests.join(', ')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('interests', e.target.value.split(',').map((i: string) => i.trim()))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Select 
              value={formData.purpose || undefined} 
              onValueChange={(value: string) => handleChange('purpose', value)}
            >
              <SelectTrigger id="purpose" name="purpose">
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendship">Friendship</SelectItem>
                <SelectItem value="casual">Casual Dating</SelectItem>
                <SelectItem value="longTerm">Long-term Dating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min="18"
              max="100"
              value={formData.age}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('age', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender || undefined} 
              onValueChange={(value: string) => handleChange('gender', value)}
            >
              <SelectTrigger id="gender" name="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label id="search-scope-label">Search Scope</Label>
            <ToggleGroup 
              type="single" 
              value={formData.searchGlobally ? "global" : "country"} 
              onValueChange={(value: string) => handleChange('searchGlobally', value === "global")}
              aria-labelledby="search-scope-label"
            >
              <ToggleGroupItem value="global" className="w-full">Global</ToggleGroupItem>
              <ToggleGroupItem value="country" className="w-full">Country-specific</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {!formData.searchGlobally && (
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country || undefined} onValueChange={(value: string) => handleChange('country', value)}>
                <SelectTrigger id="country" name="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="personalityType">Personality Type</Label>
            <Select 
              value={formData.personalityType || undefined} 
              onValueChange={(value: string) => handleChange('personalityType', value)}
            >
              <SelectTrigger id="personalityType" name="personalityType">
                <SelectValue placeholder="Select personality type" />
              </SelectTrigger>
              <SelectContent>
                {personalityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label id="age-preference-label">Age Preference</Label>
            <Range
              step={1}
              min={DEFAULT_MIN_AGE}
              max={100}
              values={[formData.preferences.ageRange.min, formData.preferences.ageRange.max]}
              onChange={(values: number[]) => handlePreferenceChange('ageRange', values)}
              renderTrack={({ props, children }: { props: any; children: ReactNode }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '6px',
                    width: '100%',
                    backgroundColor: '#ccc'
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }: { props: any }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '20px',
                    width: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#999'
                  }}
                />
              )}
              aria-labelledby="age-preference-label"
            />
            <div className="flex justify-between text-sm">
              <span>{formData.preferences.ageRange.min}</span>
              <span>{formData.preferences.ageRange.max}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender Preference</Label>
            <ToggleGroup 
              type="single" 
              value={formData.preferences.genderPreference[0] || ''} 
              onValueChange={(value: string) => handlePreferenceChange('genderPreference', value ? [value] : [])}
            >
              <ToggleGroupItem value="male" className="w-full">Male</ToggleGroupItem>
              <ToggleGroupItem value="female" className="w-full">Female</ToggleGroupItem>
              <ToggleGroupItem value="non-binary" className="w-full">Non-binary</ToggleGroupItem>
              <ToggleGroupItem value="other" className="w-full">Other</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Button type="submit" className="w-full">
            Update Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;