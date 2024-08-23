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

const ProfileForm = ({ profile, onSubmit }) => {
  const [formData, setFormData] = useState(() => ({
    bio: profile?.bio || '',
    interests: Array.isArray(profile?.interests) ? profile.interests : [profile?.interests || ''],
    purpose: profile?.purpose || profile?.relationshipGoals || '',
    age: profile?.age || 18,
    gender: profile?.gender || '',
    searchGlobally: profile?.searchGlobally ?? true,
    country: profile?.country || '',
    personalityType: profile?.personalityType || '',
    preferences: {
      ageRange: profile?.preferences?.ageRange 
        ? [
            Number(profile.preferences.ageRange.min) || DEFAULT_MIN_AGE,
            Number(profile.preferences.ageRange.max) || DEFAULT_MAX_AGE
          ]
        : [DEFAULT_MIN_AGE, DEFAULT_MAX_AGE],
      genderPreference: Array.isArray(profile?.preferences?.genderPreference)
        ? profile.preferences.genderPreference
        : [profile?.preferences?.genderPreference || ''],
    }
  }));

  const { toast } = useToast();

  const updateFormData = useCallback((newProfile) => {
    if (newProfile) {
      setFormData(prevData => ({
        ...prevData,
        ...newProfile,
        preferences: {
          ...prevData.preferences,
          ...newProfile.preferences,
          ageRange: newProfile.preferences?.ageRange 
            ? [
                Number(newProfile.preferences.ageRange.min) || DEFAULT_MIN_AGE,
                Number(newProfile.preferences.ageRange.max) || DEFAULT_MAX_AGE
              ]
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

  useEffect(() => {
  }, [formData]);

  const handleChange = (name, value) => {
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      return newData;
    });
  };

  const handlePreferenceChange = (name, value) => {
    setFormData(prevData => {
      if (name === 'ageRange') {
        // Ensure the values are valid numbers and sorted
        const sortedValues = value
          .map(v => Number(v) || DEFAULT_MIN_AGE)
          .sort((a, b) => a - b);
        return {
          ...prevData,
          preferences: {
            ...prevData.preferences,
            [name]: sortedValues
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await onSubmit({
        ...formData,
        preferences: {
          ...formData.preferences,
          ageRange: {
            min: formData.preferences.ageRange[0],
            max: formData.preferences.ageRange[1]
          }
        }
      });
      updateFormData(updatedProfile); // Update the local state with the returned profile data
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
              values={formData.preferences.ageRange}
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
              renderThumb={({ props, index }) => (
                <div
                  {...props}
                  key={index}
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
              <span>{formData.preferences.ageRange[0]}</span>
              <span>{formData.preferences.ageRange[1]}</span>
            </div>
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