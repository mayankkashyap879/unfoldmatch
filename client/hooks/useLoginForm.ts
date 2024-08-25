// hooks/useLoginForm.ts

import { useState } from 'react';
import { LoginFormData } from '../types/auth';

export const useLoginForm = (onSubmit: (data: LoginFormData) => void) => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return { formData, handleChange, handleSubmit };
};