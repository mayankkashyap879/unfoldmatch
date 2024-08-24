import React, { useState, useEffect, useCallback } from 'react';
import { Range, getTrackBackground } from 'react-range';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/components/ui/use-toast";

const countries = ["United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "Brazil", "India", "China"];

const personalityTypes = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

const DEFAULT_MIN_AGE = 18;
const DEFAULT_MAX_AGE = 50;

interface Profile {
  bio: string;
  interests: string[];
  purpose: string;
  age: number;
  gender: string;
  searchGlobally: boolean;
  country: string;
  personalityType: string;
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    genderPreference: string[];
  };
}

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (updatedProfile: Profile) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSubmit }) => {
  const [formData, setFormData] = useState<Profile>(() => ({
    bio: profile?.bio || '',
    interests: Array.isArray(profile?.interests) ? profile.interests : [profile?.interests || ''],
    purpose: profile?.purpose || '',
    age: profile?.age || 18,
    gender: profile?.gender || '',
    searchGlobally: profile?.searchGlobally ?? true,
    country: profile?.country || '',
    personalityType: profile?.personalityType || '',
    preferences: {
      ageRange: profile?.preferences?.ageRange 
        ? {
            min: Number(profile.preferences.ageRange.min) || DEFAULT_MIN_AGE,
            max: Number(profile.preferences.ageRange.max) || DEFAULT_MAX_AGE
          }
        : { min: DEFAULT_MIN_AGE, max: DEFAULT_MAX_AGE },
      genderPreference: Array.isArray(profile?.preferences?.genderPreference)
        ? profile.preferences.genderPreference
        : [profile?.preferences?.genderPreference || ''],
    }
  }));

  const { toast } = useToast();

  const updateFormData = useCallback((newProfile: Partial<Profile>) => {
    if (newProfile) {
      setFormData(prevData => ({
        ...prevData,
        ...newProfile,
        preferences: {
          ...prevData.preferences,
          ...newProfile.preferences,
          ageRange: newProfile.preferences?.ageRange 
            ? {
                min: Number(newProfile.preferences.ageRange.min) || DEFAULT_MIN_AGE,
                max: Number(newProfile.preferences.ageRange.max) || DEFAULT_MAX_AGE
              }
            : prevData.preferences.ageRange,
          genderPreference: Array.isArray(newProfile.preferences?.genderPreference)
            ? newProfile.preferences.genderPreference
            : [newProfile.preferences?.genderPreference || ''],
        }
      }));
    }
  }, []);

  useEffect(() => {
    updateFormData(profile);
  }, [profile, updateFormData]);

  const handleChange = (name: keyof Profile, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePreferenceChange = (name: keyof Profile['preferences'], value: any) => {
    setFormData(prevData => {
      if (name === 'ageRange') {
        // Ensure the values are valid numbers and sorted
        const sortedValues = (value as number[])
          .map(v => Number(v) || DEFAULT_MIN_AGE)
          .sort((a, b) => a - b);
        return {
          ...prevData,
          preferences: {
            ...prevData.preferences,
            [name]: { min: sortedValues[0], max: sortedValues[1] }
          }
        };
      }
      if (name === 'genderPreference') {
        // Ensure value is always an array
        const newValue = Array.isArray(value) ? value : [value];
        return {
          ...prevData,
          preferences: {
            ...prevData.preferences,
            [name]: newValue
          }
        };
      }
      return {
        ...prevData,
        preferences: {
          ...prevData.preferences,
          [name]: value
        }
      };
    });
  };

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
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              name="interests"
              value={formData.interests.join(', ')}
              onChange={(e) => handleChange('interests', e.target.value.split(',').map(i => i.trim()))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Select 
              value={formData.purpose || undefined} 
              onValueChange={(value) => handleChange('purpose', value)}
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
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender || undefined} 
              onValueChange={(value) => handleChange('gender', value)}
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
              onValueChange={(value) => handleChange('searchGlobally', value === "global")}
              aria-labelledby="search-scope-label"
            >
              <ToggleGroupItem value="global" className="w-full">Global</ToggleGroupItem>
              <ToggleGroupItem value="country" className="w-full">Country-specific</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {!formData.searchGlobally && (
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country || undefined} onValueChange={(value) => handleChange('country', value)}>
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
              onValueChange={(value) => handleChange('personalityType', value)}
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
              onChange={(values) => handlePreferenceChange('ageRange', values)}
              renderTrack={({ props, children }) => (
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
              renderThumb={({ props }) => (
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
              onValueChange={(value) => handlePreferenceChange('genderPreference', value ? [value] : [])}
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