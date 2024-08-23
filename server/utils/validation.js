// server/utils/validation.js
const validateInput = ({ username, email, password }) => {
    const errors = [];
  
    if (username && username.trim().length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
  
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      errors.push('Email is invalid');
    }
  
    if (password && password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
  
    return errors;
  };
  
  module.exports = { validateInput };