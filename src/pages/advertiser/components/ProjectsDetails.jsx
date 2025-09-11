import React, { useState, useRef } from 'react';
import { ArrowLeft, Edit, BarChart3, Tag, Globe, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectsDetails = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Chart data
  const visibilityMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const visibilityData = [0.1, 0.2, 0.4, 0.7, 0.6, 0.5, 0.7, 0.95, 0.7, 0.5, 0.4, 0.4];

  // Sample table data
  const tableData = [
    {
      orderId: "#78757",
      web: "https://mohsin.com",
      publicationUrl: "https://todosobrewindows.com/software-antivirus-como-elegir-la-proteccion-adecuada/",
      purchaseDate: "12/10/24",
      price: "$20",
      status: "Finished"
    },
    {
      orderId: "#78758",
      web: "https://mohsin.com",
      publicationUrl: "https://todosobrewindows.com/software-antivirus-como-elegir-la-proteccion-adecuada/",
      purchaseDate: "12/10/24",
      price: "$20",
      status: "Finished"
    },
    {
      orderId: "#78759",
      web: "https://mohsin.com",
      publicationUrl: "https://todosobrewindows.com/software-antivirus-como-elegir-la-proteccion-adecuada/",
      purchaseDate: "12/10/24",
      price: "$20",
      status: "Finished"
    },
    {
      orderId: "#78760",
      web: "https://mohsin.com",
      publicationUrl: "https://todosobrewindows.com/software-antivirus-como-elegir-la-proteccion-adecuada/",
      purchaseDate: "12/10/24",
      price: "$20",
      status: "Finished"
    },
    {
      orderId: "#78761",
      web: "https://mohsin.com",
      publicationUrl: "https://todosobrewindows.com/software-antivirus-como-elegir-la-proteccion-adecuada/",
      purchaseDate: "12/10/24",
      price: "$20",
      status: "Finished"
    }
  ];

  // Simple chart component using SVG
  const VisibilityChart = () => {
    const width = 800;
    const height = 300;
    const padding = 60;
    
    const xScale = (index) => (index / (visibilityData.length - 1)) * (width - 2 * padding) + padding;
    const yScale = (value) => height - padding - (value * (height - 2 * padding));
    
    const pathData = visibilityData
      .map((value, index) => `${index === 0 ? 'M' : 'L'} ${xScale(index)} ${yScale(value)}`)
      .join(' ');

    return (
      <div className="w-full h-80 flex items-center justify-center">
        <svg width="100%" height="300" viewBox={`0 0 ${width} ${height}`} className="max-w-full">
          {/* Grid lines */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((value) => (
            <g key={value}>
              <line
                x1={padding}
                y1={yScale(value)}
                x2={width - padding}
                y2={yScale(value)}
                stroke="#333"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={yScale(value) + 4}
                fill="#bff747"
                fontSize="12"
                textAnchor="end"
              >
                {value}
              </text>
            </g>
          ))}
          
          {/* X-axis labels */}
          {visibilityMonths.map((month, index) => (
            <text
              key={month}
              x={xScale(index)}
              y={height - padding + 20}
              fill="#bff747"
              fontSize="10"
              textAnchor="middle"
            >
              {month}
            </text>
          ))}
          
          {/* Chart line */}
          <path
            d={pathData}
            fill="none"
            stroke="#bff747"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {visibilityData.map((value, index) => (
            <circle
              key={index}
              cx={xScale(index)}
              cy={yScale(value)}
              r="4"
              fill="#bff747"
            />
          ))}
        </svg>
      </div>
    );
  };

  const MetricCard = ({ logo, metrics }) => (
    <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-4 flex items-center gap-4">
      <div className="flex items-center justify-center min-w-[100px]">
        {logo}
      </div>
      <div className="flex-1 flex items-center justify-around gap-3 flex-wrap">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-[#bff747] font-bold text-sm mb-1">{metric.title}</div>
            <div className="text-sm text-gray-300">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c0c0c] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Card */}
        <div className="mb-8 bg-[#1a1a1a] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-xl font-normal text-[#bff747] mb-2">SEO Optimization Campaign</h1>
              <p className="text-gray-400">Visualize, control and grow your project, all from one place.</p>
            </div>
            <button 
              onClick={() => navigate('/advertiser/projects')}
              className="flex items-center gap-2 bg-[#bff747] text-[#0c0c0c] px-5 py-2 rounded border hover:bg-[#a8e035] transition-colors"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>
        </div>

        {/* Project Details */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
          <div className="flex-1 border border-[#333] rounded-xl p-5">
            <div className="flex justify-between items-center mb-5">
              <p className="text-[#bff747] text-lg">SEO Optimization Campaign</p>
              <p className="text-[#bff747]">https://link.com</p>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <Tag size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Categories:</p>
                <p className="text-gray-300">Animals | Beauty | Technology | Celebrities</p>
              </div>
              <div className="flex items-center gap-5">
                <Globe size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Language:</p>
                <p className="text-gray-300">Spanish</p>
              </div>
              <div className="flex items-center gap-5">
                <TrendingUp size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Objective:</p>
                <p className="text-gray-300">Increase organic traffic</p>
              </div>
            </div>
          </div>

          <div className="lg:w-80 border border-[#333] rounded-xl p-5">
            <p className="text-[#bff747] text-lg mb-4">Balance</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Total invested in this project</p>
                <p className="text-gray-300">$300</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Total invested in this project</p>
                <p className="text-gray-300">$300</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Total invested in this project</p>
                <p className="text-gray-300">$300</p>
              </div>
              <div className="flex justify-between text-sm border-b border-[#bff747] pb-3">
                <p className="text-gray-400">Total invested in this project</p>
                <p className="text-gray-300">$300</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-[#bff747] font-semibold">Total Amount</p>
                <p className="text-gray-300">$410</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="flex items-center gap-2 text-[#bff747] px-4 py-2 rounded-xl shadow-sm border border-[#333] bg-transparent hover:bg-[#1a1a1a] transition-colors">
              <Edit size={16} />
              Edit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-5 flex-wrap">
            <a 
              href="#" 
              className="px-4 py-3 text-sm border border-[#bff747] rounded-xl text-[#0c0c0c] bg-[#bff747]"
            >
              Control and Analysis
            </a>
          </div>
        </div>

        {/* SEO Metrics Title */}
        <div className="flex items-center bg-[#1a1a1a] p-5 rounded-xl border border-[#333] mb-5">
          <BarChart3 size={16} className="mr-3 text-[#bff747]" />
          <h2 className="text-[#bff747] font-bold text-lg">SEO Metrics</h2>
        </div>

        {/* Metrics Cards */}
        <div className="space-y-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-5">
            <MetricCard
              logo={<div className="text-2xl font-bold text-[#bff747]">MOZ</div>}
              metrics={[
                { title: "DA", value: "55" },
                { title: "DR", value: "40" },
                { title: "PA", value: "28" },
                { title: "Moz Links", value: "0.239%" },
                { title: "Moz Ranks", value: "750" },
                { title: "Traffic", value: "1200" }
              ]}
            />
            
            <MetricCard
              logo={<div className="text-2xl font-bold text-[#bff747]">AHREFS</div>}
              metrics={[
                { title: "DA", value: "13" },
                { title: "DR", value: "56" },
                { title: "BL", value: "34" },
                { title: "OBL", value: "10" },
                { title: "Organic Traffic", value: "750" },
                { title: "Keywords", value: "1200" }
              ]}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-5">
            <MetricCard
              logo={<div className="text-2xl font-bold text-[#bff747]">SISTRIX</div>}
              metrics={[
                { title: "CF", value: "11" },
                { title: "TF", value: "9" },
                { title: "Majestic Links", value: "45" },
                { title: "Majestic RD", value: "19" }
              ]}
            />
            
            <MetricCard
              logo={<div className="text-2xl font-bold text-[#bff747]">MAJESTIC</div>}
              metrics={[
                { title: "Visibility Index", value: "00" }
              ]}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-5 mb-8">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[#bff747] text-lg font-medium">Visibility Index</h3>
            <button className="bg-[#bff747] text-[#0c0c0c] px-3 py-2 rounded-xl text-sm">
              This Year
            </button>
          </div>
          <VisibilityChart />
        </div>

        {/* Orders Table */}
        <div className="bg-[#1a1a1a] rounded-2xl border border-[#333] overflow-x-auto">
          <div className="p-5">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-4 px-5 text-[#bff747] font-semibold border-b border-[#333] whitespace-nowrap">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-5 text-[#bff747] font-semibold border-b border-[#333] whitespace-nowrap">
                    Web
                  </th>
                  <th className="text-left py-4 px-5 text-[#bff747] font-semibold border-b border-[#333] whitespace-nowrap">
                    Publication URL
                  </th>
                  <th className="text-left py-4 px-5 text-[#bff747] font-semibold border-b border-[#333] whitespace-nowrap">
                    Purchase Date
                  </th>
                  <th className="text-left py-4 px-5 text-[#bff747] font-semibold border-b border-[#333] whitespace-nowrap">
                    Price
                  </th>
                  <th className="text-left py-4 px-5 text-[#bff747] font-semibold border-b border-[#333] whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td className="py-4 px-5 text-sm text-gray-300 font-semibold whitespace-nowrap">
                      {row.orderId}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-300 font-semibold whitespace-nowrap">
                      {row.web}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-300 font-semibold whitespace-nowrap max-w-xs truncate">
                      {row.publicationUrl}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-300 font-semibold whitespace-nowrap">
                      {row.purchaseDate}
                    </td>
                    <td className="py-4 px-5 text-sm text-gray-300 font-semibold whitespace-nowrap">
                      {row.price}
                    </td>
                    <td className="py-4 px-5 text-sm text-[#bff747] font-semibold whitespace-nowrap">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsDetails;