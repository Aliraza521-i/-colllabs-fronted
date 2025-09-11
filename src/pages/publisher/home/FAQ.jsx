import React, { useState } from 'react';

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(0);

  const faqData = [
    {
      question: "What is your refund policy?",
      answer: "If you're not satisfied with our service, you can request a refund within 30 days of purchase."
    },
    {
      question: "How do I contact support?",
      answer: "You can contact our support team through the contact form on our website or by emailing support@contlink.com."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team via live chat, email, or phone during business hours."
    },
    {
      question: "How do I contact support?",
      answer: "Our support team is available 24/7 through multiple channels including email and live chat."
    },
    {
      question: "How do I contact support?",
      answer: "Contact support through our help center, email, or phone for immediate assistance."
    },
    {
      question: "How do I contact support?",
      answer: "Support is available through our ticketing system, email, and phone support."
    },
    {
      question: "How do I contact support?",
      answer: "You can get help from our support team via email, chat, or by calling our helpline."
    },
    {
      question: "How do I contact support?",
      answer: "Our customer support team can be reached through multiple channels for your convenience."
    },
    {
      question: "Do you offer discounts for teams?",
      answer: "Yes, we offer special pricing and discounts for team accounts and bulk purchases."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-6">
      <div className=" max-w-6xl mx-auto">
        <div className="bg-[#0c0c0c] rounded-xl shadow-lg border border-[#bff747]/30 p-8">
          {/* Header */}
          <h1 className="text-2xl font-semibold text-[#bff747] mb-8">
            Frequently Asked Questions
          </h1>

          {/* FAQ Items */}
          <div className="space-y-1">
            {faqData.map((item, index) => (
              <div key={index} className="border-b border-[#bff747]/30 last:border-b-0">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-[#bff747]/10 px-2 rounded"
                >
                  <span className="text-[#bff747] font-medium">
                    {item.question}
                  </span>
                  <span 
                    className="text-2xl font-light transition-transform duration-200"
                    style={{ 
                      color: '#bff747',
                      transform: openQuestion === index ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    +
                  </span>
                </button>
                
                {openQuestion === index && (
                  <div className="pb-4 px-2">
                    <p className="text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;