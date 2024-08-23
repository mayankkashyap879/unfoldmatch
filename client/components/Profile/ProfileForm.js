import React, { useState, useEffect } from 'react';
import { Range } from 'react-range';
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

const ProfileForm = ({ profile, onSubmit }) => {
  const [formData, setFormData] = useState({
    bio: '',
    interests: [],
    purpose: '',
    age: 18,
    gender: '',
    searchGlobally: true,
    country: '',
    personalityType: '',
    preferences: {
      ageRange: [18, 50],
      genderPreference: [],
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      console.log("Received profile data:", profile); // Log received profile data
      setFormData({
        bio: profile.bio || '',
        interests: Array.isArray(profile.interests) ? profile.interests : [profile.interests || ''],
        purpose: profile.purpose || profile.relationshipGoals || '',
        age: profile.age || 18,
        gender: profile.gender || '',
        searchGlobally: profile.searchGlobally ?? true,
        country: profile.country || '',
        personalityType: profile.personalityType || '',
        preferences: {
          ageRange: profile.preferences?.ageRange 
            ? [profile.preferences.ageRange.min, profile.preferences.ageRange.max]
            : [18, 50],
          genderPreference: Array.isArray(profile.preferences?.genderPreference)
            ? profile.preferences.genderPreference
            : [profile.preferences?.genderPreference || ''],
        }
      });
    }
  }, [profile]);

  useEffect(() => {
    console.log("Updated formData:", formData); // Log formData after it's been set
  }, [formData]);

  const handleChange = (name, value) => {
    console.log(`Changing ${name} to:`, value); // Log each change
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePreferenceChange = (name, value) => {
    console.log(`Changing preference ${name} to:`, value); // Log each preference change
    setFormData(prevData => ({
      ...prevData,
      preferences: {
        ...prevData.preferences,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData); // Log form data on submit

    // ... rest of the submit logic
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
            />
          </div>

          {/* Interests field */}
          <div className="space-y-2">
            <Label htmlFor="interests">Interests (comma-separated)</Label>
            <Input
              id="interests"
              value={formData.interests.join(', ')}
              onChange={(e) => handleChange('interests', e.target.value.split(',').map(i => i.trim()))}
            />
          </div>

          {/* Purpose field */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Select value={formData.purpose} onValueChange={(value) => handleChange('purpose', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendship">Friendship</SelectItem>
                <SelectItem value="casual">Casual Dating</SelectItem>
                <SelectItem value="longTerm">Long-term Dating</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Age field */}
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={formData.age}
              onChange={(e) => handleChange('age', parseInt(e.target.value))}
            />
          </div>

          {/* Gender field */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger>
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

          {/* Search Globally toggle */}
          <div className="space-y-2">
            <Label>Search Scope</Label>
            <ToggleGroup type="single" value={formData.searchGlobally ? "global" : "country"} onValueChange={(value) => handleChange('searchGlobally', value === "global")}>
              <ToggleGroupItem value="global" className="w-full">Global</ToggleGroupItem>
              <ToggleGroupItem value="country" className="w-full">Country-specific</ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Country field (only show if not searching globally) */}
          {!formData.searchGlobally && (
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                <SelectTrigger>
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

          {/* Personality Type field */}
          <div className="space-y-2">
            <Label htmlFor="personalityType">Personality Type</Label>
            <Select value={formData.personalityType} onValueChange={(value) => handleChange('personalityType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select personality type" />
              </SelectTrigger>
              <SelectContent>
              {personalityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Preference Range */}
          <div className="space-y-2">
            <Label>Age Preference</Label>
            <Range
              step={1}
              min={18}
              max={50}
              values={formData.preferences.ageRange}
              onChange={(values) => handlePreferenceChange('ageRange', values)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '6px',
                    width: '100%',
                    backgroundColor: '#FFA500'
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
                    backgroundColor: '#FF8C00'
                  }}
                />
              )}
            />
            <div className="flex justify-between text-sm">
              <span>{formData.preferences.ageRange[0]}</span>
              <span>{formData.preferences.ageRange[1]}</span>
            </div>
          </div>

          {/* Gender Preference field */}
          <div className="space-y-2">
            <Label>Gender Preference</Label>
            <ToggleGroup 
              type="multiple" 
              value={formData.preferences.genderPreference} 
              onValueChange={(value) => handlePreferenceChange('genderPreference', value)}
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