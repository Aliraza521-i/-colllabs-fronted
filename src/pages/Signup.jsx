import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "publisher",
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError(''); // Clear error when typing
  };

  const handlePhoneChange = (phone) => {
    setFormData({
      ...formData,
      phoneNumber: phone
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.agreedToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      };

      const result = await register(registrationData);

      if (result.success) {
        // Redirect based on user role
        const userRole = result.user.role;
        switch (userRole) {
          case 'publisher':
            navigate('/publisher');
            break;
          case 'advertiser':
            navigate('/advertiser');
            break;
          default:
            navigate('/publisher');
        }
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0c0c0c]">
      <div className="bg-[#0c0c0c] shadow-lg rounded-lg w-[450px] p-8 border border-[#bff747]/30">
        <h2 className="text-xl font-semibold mb-6 text-center text-[#bff747]">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`border p-2 w-full rounded transition-colors bg-[#0c0c0c] text-[#bff747] ${
                error ? 'border-red-500' : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              required
              disabled={loading}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`border p-2 w-full rounded transition-colors bg-[#0c0c0c] text-[#bff747] ${
                error ? 'border-red-500' : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={`border p-2 w-full rounded transition-colors bg-[#0c0c0c] text-[#bff747] ${
              error ? 'border-red-500' : 'border-[#bff747]/30 focus:border-[#bff747]'
            }`}
            required
            disabled={loading}
          />

          {/* Password Fields */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={`border p-2 w-full rounded transition-colors bg-[#0c0c0c] text-[#bff747] ${
                error ? 'border-red-500' : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`border p-2 w-full rounded transition-colors bg-[#0c0c0c] text-[#bff747] ${
                error ? 'border-red-500' : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              required
              disabled={loading}
            />
          </div>

          {/* Phone */}
          <PhoneInput
            country={'us'}
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            inputClass={`!w-full !border !p-2 !rounded !transition-colors !bg-[#0c0c0c] !text-[#bff747] ${
              error ? '!border-red-500' : '!border-[#bff747]/30 focus:!border-[#bff747]'
            }`}
            containerClass="!w-full"
            disabled={loading}
            buttonClass="!bg-[#0c0c0c] !border-[#bff747]/30"
            dropdownClass="!bg-[#0c0c0c] !text-[#bff747]"
          />

          {/* Role Selection */}
          <div>
            <label className="block text-[#bff747] font-medium mb-2">Choose your role:</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => !loading && setFormData({...formData, role: 'publisher'})}
                className={`cursor-pointer rounded-lg p-3 text-center border-2 transition-all ${
                  formData.role === 'publisher' 
                    ? 'border-[#bff747] bg-[#0c0c0c]' 
                    : 'border-[#bff747]/30 hover:border-[#bff747] bg-[#0c0c0c]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-3xl mb-2 text-[#bff747]">🏠</div>
                <p className={`text-sm font-medium ${
                  formData.role === 'publisher' ? 'text-[#bff747]' : 'text-[#bff747]'
                }`}>
                  Publisher
                </p>
                <p className="text-xs text-gray-400">Sell guest posts</p>
              </div>
              
              <div
                onClick={() => !loading && setFormData({...formData, role: 'advertiser'})}
                className={`cursor-pointer rounded-lg p-3 text-center border-2 transition-all ${
                  formData.role === 'advertiser' 
                    ? 'border-[#bff747] bg-[#0c0c0c]' 
                    : 'border-[#bff747]/30 hover:border-[#bff747] bg-[#0c0c0c]'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-3xl mb-2 text-[#bff747]">📢</div>
                <p className={`text-sm font-medium ${
                  formData.role === 'advertiser' ? 'text-[#bff747]' : 'text-[#bff747]'
                }`}>
                  Advertiser
                </p>
                <p className="text-xs text-gray-400">Buy guest posts</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
              className="w-4 h-4 text-[#bff747] rounded focus:ring-[#bff747] bg-[#0c0c0c] border-[#bff747]/30"
              disabled={loading}
            />
            <label className="text-sm text-gray-300">
              I agree to the{" "}
              <span className="text-[#bff747] cursor-pointer hover:underline">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-[#bff747] cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.agreedToTerms}
            className={`w-full py-2 rounded transition-colors ${
              loading || !formData.agreedToTerms
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#bff747] hover:bg-[#bff747]/80 text-[#0c0c0c]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c0c0c]"></div>
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="text-sm text-center mt-2 text-gray-300">
            Already have an account?{" "}
            <span 
              onClick={() => navigate('/login')}
              className="text-[#bff747] cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;