export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4 (weak to strong)
  rules: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
  feedback: string[];
}

export interface FormValidation {
  email: {
    isValid: boolean;
    message: string;
  };
  password: PasswordValidation;
  confirmPassword: {
    isValid: boolean;
    message: string;
  };
  name: {
    isValid: boolean;
    message: string;
  };
}

export const validatePassword = (password: string): PasswordValidation => {
  const rules = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const rulesPassed = Object.values(rules).filter(Boolean).length;
  const score = Math.min(rulesPassed, 4);

  const feedback: string[] = [];
  if (!rules.length) feedback.push('At least 8 characters');
  if (!rules.lowercase) feedback.push('One lowercase letter');
  if (!rules.uppercase) feedback.push('One uppercase letter');
  if (!rules.number) feedback.push('One number');
  if (!rules.special) feedback.push('One special character (recommended)');

  const isValid = rules.length && rules.lowercase && rules.uppercase && rules.number;

  return {
    isValid,
    score,
    rules,
    feedback,
  };
};

export const validateEmail = (email: string): { isValid: boolean; message: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: '' };
};

export const validateName = (name: string): { isValid: boolean; message: string } => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters' };
  }

  return { isValid: true, message: '' };
};

export const validatePasswordMatch = (
  password: string, 
  confirmPassword: string
): { isValid: boolean; message: string } => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }

  return { isValid: true, message: 'Passwords match' };
};

export const validateForm = (formData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): FormValidation => {
  return {
    name: validateName(formData.name),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: validatePasswordMatch(formData.password, formData.confirmPassword),
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return 'Invalid';
  }
};