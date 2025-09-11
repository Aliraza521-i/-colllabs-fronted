import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

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
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/publisher'); // Default to publisher
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0c0c0c]">
      <div className="bg-[#0c0c0c] shadow-lg rounded-lg w-[450px] p-8 border border-[#bff747]/30">
        <h2 className="text-xl font-semibold mb-6 text-center text-[#bff747]">Log in to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="mail@domain.com"
              value={formData.email}
              onChange={handleChange}
              className={`border p-2 w-full rounded transition-colors bg-[#0c0c0c] text-[#bff747] ${
                error ? 'border-red-500' : 'border-[#bff747]/30 focus:border-[#bff747]'
              }`}
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">It is necessary to fill in</p>
          </div>

          {/* Password */}
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

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 border border-red-500/30 rounded px-3 py-2">
              {error}
            </div>
          )}

          {/* Remember me */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="rounded text-[#bff747] focus:ring-[#bff747] bg-[#0c0c0c] border-[#bff747]/30"
              />
              Remember me
            </label>
            <span className="text-[#bff747] cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className={`w-full py-2 rounded transition-colors ${
              loading || !formData.email || !formData.password
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#bff747] hover:bg-[#bff747]/80 text-[#0c0c0c]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0c0c0c]"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </button>

          {/* Signup link */}
          <p className="text-sm text-center mt-2 text-gray-300">
            Still have no account?{" "}
            <span 
              onClick={() => navigate('/signup')}
              className="text-[#bff747] cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;