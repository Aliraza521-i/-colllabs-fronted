import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: 'Mark Allison',
    companyName: '',
    email: 'example@email.com',
    phoneNumber: '+1 (230) 456 0972',
    message: ''
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
    console.log('Form submitted:', formData);
    // Show success message with the new color scheme
    alert('Form submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4 sm:p-6">
      {/* Updated with dark theme and new color scheme */}
      <div className="w-full max-w-6xl bg-[#1a1a1a] rounded-2xl shadow-xl border border-[#333]">
        <div className="px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#bff747] mb-2">Get in Touch</h1>
            <p className="text-gray-400 text-sm sm:text-base">Have questions? We're here to help!</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            
            {/* First row: Full Name and Company Name - Made responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#bff747] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a2a2a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white placeholder-gray-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-[#bff747] mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a2a2a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white placeholder-gray-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Second row: Email and Phone Number - Made responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#bff747] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a2a2a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white placeholder-gray-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#bff747] mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a2a2a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white placeholder-gray-500 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Third row: Message - Made responsive */}
            <div className="mb-6 sm:mb-8">
              <label htmlFor="message" className="block text-sm font-medium text-[#bff747] mb-1">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Type your message here......"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-[#2a2a2a] border border-[#333] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bff747] focus:border-[#bff747] text-white placeholder-gray-500 text-sm sm:text-base"
              ></textarea>
            </div>

            {/* Submit button centered - Made responsive */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 sm:px-8 py-2 sm:py-3 bg-[#bff747] text-[#0c0c0c] font-medium rounded-md hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747] transition-colors duration-300 w-full sm:w-auto text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;