export interface User {
    id: string;
    email: string;
    username: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
    checkAuth: () => Promise<boolean>;
  }

  export interface RegisterFormProps {
    onSubmit: (username: string, email: string, password: string) => void;
    error: string;
  }
  
  export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
  }

  export interface LoginFormProps {
    onSubmit: (identifier: string, password: string) => void;
    error: string;
  }
  
  export interface LoginFormData {
    identifier: string;
    password: string;
  }