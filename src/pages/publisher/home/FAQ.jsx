import React, { useState } from 'react';

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqData = [
    {
      question: "How do I get started as a publisher?",
      answer: "To get started as a publisher, you need to register an account, add your websites for approval, and then start accepting order requests from advertisers."
    },
    {
      question: "How do I receive payments for completed orders?",
      answer: "Payments are processed through our secure wallet system. Once an order is completed and approved by the advertiser, the earnings are transferred to your wallet and can be withdrawn at any time."
    },
    {
      question: "What happens if an order is rejected?",
      answer: "If an order is rejected, you'll receive feedback from the advertiser explaining the reasons. You can address the concerns and resubmit the order, or discuss further with the advertiser through the chat system."
    },
    {
      question: "How long do I have to complete an order?",
      answer: "The deadline for each order is specified when you accept it. Make sure to communicate with the advertiser if you need more time to complete the work."
    },
    {
      question: "What types of content can I publish?",
      answer: "You can publish various types of content including articles, blog posts, product reviews, and news pieces. All content must comply with our quality guidelines and the website's content policy."
    },
    {
      question: "How do I contact support?",
      answer: "You can contact our support team through the help center, live chat, or by emailing support@contlink.com. Our support team is available 24/7 to assist you."
    }
  ];

  const toggleQuestion = (index) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="bg-[#0c0c0c] p-4 sm:p-6 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#0c0c0c] rounded-xl shadow-lg border border-[#bff747]/30 p-6 sm:p-8">
          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-semibold text-[#bff747] mb-6 text-center">
            Frequently Asked Questions
          </h2>

          {/* FAQ Items */}
          <div className="space-y-3">
            {faqData.map((item, index) => (
              <div key={index} className="border-b border-[#bff747]/30 last:border-b-0">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full flex items-center justify-between py-4 text-left hover:bg-[#bff747]/10 px-2 sm:px-4 rounded transition-colors"
                >
                  <span className="text-[#bff747] font-medium text-sm sm:text-base">
                    {item.question}
                  </span>
                  <span 
                    className="text-xl sm:text-2xl font-light transition-transform duration-200 ml-2 flex-shrink-0"
                    style={{ 
                      color: '#bff747',
                      transform: openQuestion === index ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}
                  >
                    +
                  </span>
                </button>
                
                {openQuestion === index && (
                  <div className="pb-4 px-2 sm:px-4">
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
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