import React from 'react';

const wallet = () => {
  const steps = [
    'Add your Website',
    'Confirm your Ownership',
    'Description and price',
    'Earn'
  ];

  const transactions = [
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Completed', statusColor: 'green' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Pending', statusColor: 'yellow' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Cancelled', statusColor: 'red' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Completed', statusColor: 'green' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Pending', statusColor: 'yellow' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Cancelled', statusColor: 'red' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Completed', statusColor: 'green' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Pending', statusColor: 'yellow' },
    { date: '12/10/24', concept: 'PayPal', amount: '$100', credit: '$100', status: 'Cancelled', statusColor: 'red' }
  ];

  const getStatusBadge = (status, color) => {
    const colorClasses = {
      green: 'bg-green-900/30 text-green-400 border border-green-500/30',
      yellow: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      red: 'bg-red-900/30 text-red-400 border border-red-500/30'
    };

    const dotColors = {
      green: 'bg-green-400',
      yellow: 'bg-yellow-400',
      red: 'bg-red-400'
    };

    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}>
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`}></span>
        {status}
      </span>
    );
  };

  const BillIcon = () => (
    <div className="w-8 h-8 bg-[#2a2a2a] border border-[#333] rounded flex items-center justify-center">
      <div className="text-xs text-[#bff747]">📄</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c0c0c] p-4 flex justify-center">
      {/* Centered container */}
      <div className="w-full max-w-7xl">
        
        {/* Pending Clearance Cards - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 w-full">
          {[1, 2, 3].map((card) => (
            <div key={card} className="bg-[#1a1a1a] border-2 border-[#bff747]/30 rounded-lg p-4 text-center">
              <div className="text-[#bff747] text-sm font-medium mb-4">
                Pending Clearance
              </div>
              <div className="border-b border-[#333] mb-4"></div>
              <div className="text-[#bff747] text-2xl font-bold">
                $116.56
              </div>
            </div>
          ))}
        </div>

        {/* Credit Movements Table */}
        <div className="bg-[#1a1a1a] border-2 border-[#bff747]/30 rounded-lg overflow-hidden w-full">
          <div className="p-4 border-b border-[#333]">
            <h2 className="text-xl font-medium text-[#bff747]">
              Credit Movements
            </h2>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {transactions.map((transaction, index) => (
              <div key={index} className="border-b border-[#333] p-4 hover:bg-[#2a2a2a]">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-300">{transaction.date}</div>
                  <div>{getStatusBadge(transaction.status, transaction.statusColor)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-xs text-gray-500">Concept</div>
                    <div className="text-sm text-white">{transaction.concept}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount</div>
                    <div className="text-sm text-white">{transaction.amount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Credit</div>
                    <div className="text-sm text-white">{transaction.credit}</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <BillIcon />
                </div>
              </div>
            ))}
            {/* Total Row */}
            <div className="border-b-2 border-[#bff747]/30 bg-[#2a2a2a] p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-bold text-[#bff747]">Total Amount</div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-300">$820</div>
                  <div className="text-sm font-bold text-gray-300">$300</div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#bff747]">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#bff747]">Concept</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#bff747]">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#bff747]">Credit</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#bff747]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#bff747]">Bill</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-[#333] hover:bg-[#2a2a2a]">
                    <td className="px-6 py-4 text-sm text-gray-300">{transaction.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{transaction.concept}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{transaction.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{transaction.credit}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(transaction.status, transaction.statusColor)}
                    </td>
                    <td className="px-6 py-4">
                      <BillIcon />
                    </td>
                  </tr>
                ))}
                <tr className="border-b-2 border-[#bff747]/30 bg-[#2a2a2a]">
                  <td className="px-6 py-4 text-sm font-bold text-[#bff747]" colSpan="2">Total Amount</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-300">$820</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-300">$300</td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default wallet;