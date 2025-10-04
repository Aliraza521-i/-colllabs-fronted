import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { X, ExternalLink, Tag, BarChart3, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { websiteAPI } from '../../../services/api';

Chart.register(...registerables);

const WebsiteDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { website: passedWebsite } = location.state || {};
  
  const [website, setWebsite] = useState(passedWebsite || null);
  const [loading, setLoading] = useState(!passedWebsite);
  const [error, setError] = useState('');

  const trafficChartRef = useRef(null);
  const visibilityChartRef = useRef(null);
  const trafficChartInstance = useRef(null);
  const visibilityChartInstance = useRef(null);

  // Fetch website details from backend if not passed or if we want to ensure latest data
  useEffect(() => {
    const fetchWebsiteDetails = async () => {
      if (!passedWebsite?._id) return;
      
      try {
        setLoading(true);
        const response = await websiteAPI.getWebsite(passedWebsite._id);
        if (response.data && response.data.ok) {
          setWebsite(response.data.data);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch website details');
        }
      } catch (err) {
        console.error('Error fetching website details:', err);
        setError('Failed to load website details. Showing cached data.');
        // Fallback to passed website data
        setWebsite(passedWebsite);
      } finally {
        setLoading(false);
      }
    };

    if (passedWebsite) {
      fetchWebsiteDetails();
    }
  }, [passedWebsite]);

  useEffect(() => {
    // Traffic Chart Data
    const trafficMonths = [
      "November 2023", "December 2023", "January 2024", "February 2024",
      "March 2024", "April 2024", "May 2024", "June 2024",
      "July 2024", "August 2024", "September 2024", "October 2024"
    ];
    const trafficData = [500, 450, 380, 420, 180, 190, 250, 350, 400, 350, 300, 500];

    // Visibility Chart Data
    const visibilityMonths = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const visibilityData = [0.1, 0.2, 0.4, 0.7, 0.6, 0.5, 0.7, 0.95, 0.7, 0.5, 0.4, 0.4];

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0 }
      },
      scales: {
        x: {
          grid: { color: "#333", drawBorder: false },
          ticks: { font: { size: 10 }, color: "#bff747" }
        },
        y: {
          grid: { color: "#333", drawBorder: false },
          beginAtZero: true,
          ticks: { color: "#bff747" }
        }
      },
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1a1a1a',
          titleColor: '#bff747',
          bodyColor: '#fff',
          borderColor: '#bff747',
          borderWidth: 1
        }
      }
    };

    // Create Traffic Chart
    if (trafficChartRef.current) {
      const ctx = trafficChartRef.current.getContext('2d');
      trafficChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trafficMonths,
          datasets: [{
            data: trafficData,
            borderColor: '#bff747',
            backgroundColor: 'rgba(191, 247, 71, 0.1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: {
              ...commonOptions.scales.y,
              max: 600,
              ticks: { ...commonOptions.scales.y.ticks, stepSize: 100 }
            }
          }
        }
      });
    }

    // Create Visibility Chart
    if (visibilityChartRef.current) {
      const ctx = visibilityChartRef.current.getContext('2d');
      visibilityChartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: visibilityMonths,
          datasets: [{
            data: visibilityData,
            borderColor: '#bff747',
            backgroundColor: 'rgba(191, 247, 71, 0.1)',
            borderWidth: 2,
            fill: false
          }]
        },
        options: {
          ...commonOptions,
          scales: {
            ...commonOptions.scales,
            y: {
              ...commonOptions.scales.y,
              max: 1.0,
              ticks: { ...commonOptions.scales.y.ticks, stepSize: 0.1 }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (trafficChartInstance.current) {
        trafficChartInstance.current.destroy();
      }
      if (visibilityChartInstance.current) {
        visibilityChartInstance.current.destroy();
      }
    };
  }, []);

  const MetricCard = ({ logo, metrics }) => (
    <div className="w-full bg-[#1a1a1a] rounded-lg border border-[#333] p-4 flex items-center gap-3">
      <div className="flex items-center justify-center">
        <div className="bg-[#2a2a2a] border-2 border-[#333] rounded-xl w-16 h-16 flex items-center justify-center">
          <span className="text-xs text-[#bff747]">{logo}</span>
        </div>
      </div>
      <div className="w-full flex items-center justify-around gap-3 flex-wrap">
        {metrics.map((metric, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-[#bff747] font-bold mb-1 text-sm">{metric.title}</div>
            <div className="text-sm text-gray-300">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] font-sans flex items-center justify-center">
        <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-lg text-center border border-[#333]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading website details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] font-sans flex items-center justify-center">
        <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-lg border border-[#333]">
          <h2 className="text-xl font-bold text-[#bff747] mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded-lg hover:bg-[#a8e035]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If no website data is available, show a message
  if (!website) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] font-sans flex items-center justify-center">
        <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-lg border border-[#333]">
          <h2 className="text-xl font-bold text-[#bff747] mb-4">No Website Data</h2>
          <p className="text-gray-300 mb-4">Website details are not available.</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#bff747] text-[#0c0c0c] px-4 py-2 rounded-lg hover:bg-[#a8e035]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] font-sans">
      <div className="flex min-h-screen">
        {/* Menu Toggle Button */}
        <button 
          className="lg:hidden flex w-11 h-11 border-none rounded-lg cursor-pointer items-center justify-center bg-transparent"
          onClick={() => navigate('/publisher/websites')}
        >
          <Menu className="w-5 h-5 text-[#bff747]" />
        </button>

        {/* Main Content */}
        <main className="flex-1 bg-[#0c0c0c] min-h-screen ml-0 lg:ml-60 transition-all duration-300">
          <div className="p-4 sm:p-5">
            <h1 className="text-[#bff747] text-lg mb-5 font-medium">Websites</h1>

            <div className="relative p-4 shadow-2xl rounded-2xl bg-[#1a1a1a] border border-[#333]">
              <X 
                className="absolute top-3 right-3 w-4 h-4 cursor-pointer text-gray-400 hover:text-[#bff747]" 
                onClick={() => navigate('/publisher/websites')}
              />

              {/* Website Details Section */}
              <div className="my-5 flex gap-3 shadow-md p-4 rounded-xl justify-between flex-col lg:flex-row bg-[#2a2a2a] border border-[#333]">
                <div className="bg-[#333] border-2 border-[#444] rounded-xl w-full lg:w-32 h-20 flex items-center justify-center">
                  <span className="text-gray-400">Website Image</span>
                </div>
                
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-3 text-gray-300">
                    <h1 className="text-xl font-normal">{website.domain || 'https://example.com'}</h1>
                    <ExternalLink className="w-4 h-4 text-[#bff747]" />
                  </div>
                  <p className="text-sm text-gray-400">
                    {website.siteDescription || 'Website description not available.'}
                  </p>
                  <div className="flex items-center gap-3 text-gray-300">
                    <Tag className="w-4 h-4 text-[#bff747]" />
                    <h3 className="text-lg font-normal">Category: 
                      <span className="text-sm text-gray-400">
                        {website.allCategories && website.allCategories.length > 0 
                          ? website.allCategories.join(', ') 
                          : (website.category || 'Not specified')}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base text-[#bff747] font-normal">Publishing Price:</h3>
                    <span className="text-lg text-[#bff747]">${website.publishingPrice || '0'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-normal text-[#bff747]">Copywriting Price:</h3>
                    <p className="text-[#bff747]">${website.copywritingPrice || '0'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-normal text-gray-400">Homepage Announcement:</h3>
                    <p className="text-gray-300">${website.homepageAnnouncementPrice || '0'}</p>
                  </div>
                </div>
              </div>

              {/* Info Cards - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5">
                  <div className="text-sm text-gray-300 mb-4">Country, Language</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-[#333] border-2 border-[#444] rounded-xl w-8 h-5 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Flag</span>
                    </div>
                    <div className="text-gray-300">{website.country || 'Not specified'}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-[#333] border-2 border-[#444] rounded-xl w-8 h-5 flex items-center justify-center">
                      <span className="text-xs text-gray-400">Flag</span>
                    </div>
                    <div className="text-gray-300">{website.mainLanguage || 'Not specified'}</div>
                  </div>
                  {website.additionalCountries && website.additionalCountries.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Additional: {website.additionalCountries.join(', ')}
                    </div>
                  )}
                  {website.additionalLanguages && website.additionalLanguages.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Languages: {website.additionalLanguages.join(', ')}
                    </div>
                  )}
                  {website.keywords && website.keywords.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Keywords: {website.keywords.join(', ')}
                    </div>
                  )}
                </div>

                <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5">
                  <div className="text-sm text-gray-300 mb-4">Links</div>
                  <div className="text-xs text-gray-300 mb-2">{website.numberOfLinks || 'N/A'} Links max/post</div>
                  <div className="text-xs text-gray-300 mb-2">Link Type: {website.linkType || 'Not specified'}</div>
                  <div className="text-xs text-gray-300">
                    Discount: {website.discountPercentage || 0}%
                  </div>
                </div>

                <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5">
                  <div className="text-sm text-gray-300 mb-4">Publication Details</div>
                  <div className="text-xs text-gray-300 mb-2">
                    Publishes in main page: {website.homePagePublish ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-300 mb-2">
                    Publishes in related categories: {website.relatedCategories ? 'Yes' : 'No'}
                  </div>
                  <div className="text-xs text-gray-300">
                    Sensitive Content Extra Charge: ${website.sensitiveContentExtraCharge || '0'}
                  </div>
                </div>
              </div>

              {/* Publishing Sections and Advertising Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5">
                  <div className="text-sm text-[#bff747] mb-2 font-medium">Publishing Sections</div>
                  <div className="text-gray-300 text-sm">
                    {website.publishingSections || 'Not specified'}
                  </div>
                </div>
                
                <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5">
                  <div className="text-sm text-[#bff747] mb-2 font-medium">Advertising Requirements</div>
                  <div className="text-gray-300 text-sm">
                    {website.advertisingRequirements || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* SEO Metrics Title */}
              <div className="flex items-center my-5 text-[#bff747] font-bold text-lg bg-[#2a2a2a] p-3 rounded-lg border border-[#333]">
                <BarChart3 className="w-4 h-4 mr-2" />
                SEO Metrics
              </div>

              {/* Metrics Cards - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <MetricCard 
                  logo="Moz"
                  metrics={[
                    { title: "DA", value: website.metrics?.da || "N/A" },
                    { title: "DR", value: website.metrics?.dr || "N/A" },
                    { title: "Monthly Traffic", value: website.metrics?.monthlyTraffic || "N/A" }
                  ]}
                />

                <MetricCard 
                  logo="Ahrefs"
                  metrics={[
                    { title: "DA", value: website.metrics?.domainAuthority || "N/A" },
                    { title: "DR", value: website.metrics?.dr || "N/A" },
                    { title: "Monthly Traffic", value: website.metrics?.monthlyTraffic || "N/A" }
                  ]}
                />

                <MetricCard 
                  logo="General"
                  metrics={[
                    { title: "Article Editing %", value: website.articleEditingPercentage || "10%" },
                    { title: "Verification Status", value: website.verificationStatus || "N/A" },
                    { title: "Status", value: website.status || "N/A" }
                  ]}
                />
              </div>

              {/* Charts - Responsive */}
              <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5 mb-8">
                <div className="text-[#bff747] text-lg mb-4 font-medium">Organic Website Traffic</div>
                <div className="w-full h-64 md:h-80">
                  <canvas ref={trafficChartRef}></canvas>
                </div>
              </div>

              <div className="bg-[#2a2a2a] rounded-lg border border-[#333] p-5 mb-8">
                <div className="text-[#bff747] text-lg mb-4 font-medium">Visibility Index</div>
                <div className="w-full h-64 md:h-80">
                  <canvas ref={visibilityChartRef}></canvas>
                </div>
              </div>

              {/* Testimonials - Responsive Grid */}
              <div className="testimonials-container">
                <h2 className="text-[#bff747] text-lg mb-5 font-medium">Based on reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[1, 2, 3, 4].map((num) => (
                    <div key={num} className="rounded-lg border border-[#333] p-5 bg-[#2a2a2a]">
                      <div className="text-[#bff747] mb-2 text-lg">★★★★★</div>
                      <div className="text-gray-300 text-base font-bold">
                        Super service. (testimonial {num})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WebsiteDetails;