// hooks/useRegisterForm.ts

import { useState, ChangeEvent, FormEvent } from 'react';
import { RegisterFormData } from '../types/auth';
import { GENDER_TYPES, USER_PURPOSES, GenderType, UserPurpose } from '@/utils/constants';

export const useRegisterForm = (onSubmit: (data: RegisterFormData) => void) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    gender: '' as GenderType,
    age: 18,
    purpose: '' as UserPurpose,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'age' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return { formData, handleChange, handleSubmit };
};