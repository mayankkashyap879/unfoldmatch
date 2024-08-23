// client/components/Profile/ProfileForm.tsx
import { useState } from 'react';

const ProfileForm = ({ profile, onSubmit }) => {
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    interests: profile.interests?.join(', ') || '',
    relationshipGoals: profile.relationshipGoals || 'friendship',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      ...formData,
      interests: formData.interests.split(',').map(interest => interest.trim()),
    };
    onSubmit(updatedProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={formData.bio}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests (comma-separated)</label>
        <input
          type="text"
          id="interests"
          name="interests"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={formData.interests}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="relationshipGoals" className="block text-sm font-medium text-gray-700">Relationship Goals</label>
        <select
          id="relationshipGoals"
          name="relationshipGoals"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          value={formData.relationshipGoals}
          onChange={handleChange}
        >
          <option value="friendship">Friendship</option>
          <option value="casual">Casual Dating</option>
          <option value="longTerm">Long-term Dating</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Update Profile
      </button>
    </form>
  );
};

export default ProfileForm;