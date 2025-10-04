import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertiserAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  GlobeAltIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ClockIcon, 
  StarIcon,
  HeartIcon as HeartOutlineIcon,
  HeartIcon as HeartSolidIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  LinkIcon,
  MapPinIcon,
  LanguageIcon,
  TagIcon,
  ServerIcon,
  // Replaced TrendingUpIcon with ChartBarIcon since it's already imported
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const WebsiteDetailsView = ({ website }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const trafficChartRef = useRef(null);
  const visibilityChartRef = useRef(null);

  if (!website) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1a1a1a] rounded-xl shadow-lg p-8 border border-[#bff747]/30">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-[#bff747]">Website details not available</h3>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Initialize favorite status if website data is available
    setIsFavorite(website.isFavorite || false);
    
    // Load Chart.js dynamically for traffic charts
    const loadCharts = async () => {
      try {
        const ChartJS = await import('chart.js');
        
        // Register Chart.js components
        ChartJS.Chart.register(
          ChartJS.CategoryScale,
          ChartJS.LinearScale,
          ChartJS.PointElement,
          ChartJS.LineElement,
          ChartJS.Title,
          ChartJS.Tooltip,
          ChartJS.Legend
        );

        // Traffic chart data (static for now)
        const trafficMonths = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const trafficData = [1200, 1900, 1500, 2200, 1800, 2500, 2100, 2800, 2400, 3000, 2700, 3200];

        // Visibility chart data (static for now)
        const visibilityMonths = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const visibilityData = [0.4, 0.5, 0.55, 0.6, 0.65, 0.68, 0.7, 0.72, 0.75, 0.78, 0.8, 0.82];

        const commonOptions = {
          responsive: true,
          maintainAspectRatio: false,
          elements: {
            line: { tension: 0.4 },
            point: { radius: 0 },
          },
          scales: {
            x: {
              grid: { display: false, color: "#2a2a2a" },
              ticks: { font: { size: 10 }, color: "#bff747" },
            },
            y: {
              grid: { color: "#2a2a2a", drawBorder: false },
              beginAtZero: true,
              ticks: { color: "#bff747" },
            },
          },
          plugins: { 
            legend: { display: false },
            tooltip: {
              titleColor: "#bff747",
              bodyColor: "#bff747",
              backgroundColor: "#0c0c0c"
            }
          },
        };

        // Create traffic chart
        if (trafficChartRef.current) {
          const ctx = trafficChartRef.current.getContext('2d');
          new ChartJS.Chart(ctx, {
            type: 'line',
            data: {
              labels: trafficMonths,
              datasets: [{
                data: trafficData,
                borderColor: "#bff747",
                backgroundColor: "rgba(191, 247, 71, 0.1)",
                borderWidth: 2,
                fill: true,
              }],
            },
            options: {
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: {
                  ...commonOptions.scales.y,
                  max: 3500,
                  ticks: { stepSize: 500, color: "#bff747" },
                },
              },
            },
          });
        }

        // Create visibility chart
        if (visibilityChartRef.current) {
          const ctx = visibilityChartRef.current.getContext('2d');
          new ChartJS.Chart(ctx, {
            type: 'line',
            data: {
              labels: visibilityMonths,
              datasets: [{
                data: visibilityData,
                borderColor: "#bff747",
                backgroundColor: "rgba(191, 247, 71, 0.1)",
                borderWidth: 2,
                fill: true,
              }],
            },
            options: {
              ...commonOptions,
              scales: {
                ...commonOptions.scales,
                y: {
                  ...commonOptions.scales.y,
                  max: 1.0,
                  ticks: { stepSize: 0.2, color: "#bff747" },
                },
              },
            },
          });
        }
      } catch (error) {
        console.error('Error loading Chart.js:', error);
      }
    };

    loadCharts();
  }, [website]);

  const handleAddToFavorites = async () => {
    try {
      setLoading(true);
      if (isFavorite) {
        await advertiserAPI.removeFromFavorites(website._id);
      } else {
        await advertiserAPI.addToFavorites(website._id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactPublisher = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      setContactLoading(true);
      console.log('Sending websiteId to create chat:', website._id);
      console.log('Type of websiteId:', typeof website._id);
      const response = await advertiserAPI.createWebsiteChat({ websiteId: website._id });
      console.log('Chat creation response:', response);
      if (response.data && response.data.ok) {
        // Navigate to the messages page with the chat room selected
        const chatId = response.data.data._id;
        navigate(`/advertiser/messages?chatId=${chatId}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setContactLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : '0.0';
  };

  const getSuccessRate = (stats) => {
    if (!stats || stats.completedOrders === 0) return 0;
    const rate = (stats.completedOrders / stats.totalOrders) * 100;
    return rate.toFixed(1);
  };

  // Render SEO metrics cards
  const renderSEOMetrics = () => {
    const metrics = [
      {
        provider: "Moz",
        icon: "M",
        metrics: [
          { label: "DA", value: website.metrics?.domainAuthority || "N/A" },
          { label: "PA", value: website.metrics?.pageAuthority || "N/A" },
          { label: "SS", value: website.metrics?.spamScore || "N/A" },
          { label: "Domain Age", value: website.metrics?.domainAge || "N/A" }
        ]
      },
      {
        provider: "Ahrefs",
        icon: "A",
        metrics: [
          { label: "DR", value: website.metrics?.ahrefsDomainRating || "N/A" },
          { label: "UR", value: website.metrics?.urlRating || "N/A" },
          { label: "Traffic", value: website.metrics?.ahrefsTraffic ? website.metrics.ahrefsTraffic.toLocaleString() : "N/A" },
          { label: "Keywords", value: website.metrics?.ahrefsKeywords || "N/A" },
          { label: "Referring Domains", value: website.metrics?.referringDomains || "N/A" }
        ]
      },
      {
        provider: "Semrush",
        icon: "S",
        metrics: [
          { label: "AS", value: website.metrics?.semrushAuthorityScore || "N/A" },
          { label: "Traffic", value: website.metrics?.semrushTraffic ? website.metrics.semrushTraffic.toLocaleString() : "N/A" },
          { label: "Keywords", value: website.metrics?.semrushKeywords || "N/A" },
          { label: "Referring Domains", value: website.metrics?.semrushReferringDomains || "N/A" }
        ]
      },
      {
        provider: "Majestic",
        icon: "Mj",
        metrics: [
          { label: "TF", value: website.metrics?.majesticTrustFlow || "N/A" },
          { label: "CF", value: website.metrics?.majesticCitationFlow || "N/A" },
          { label: "Total Index", value: website.metrics?.majesticTotalIndex || "N/A" }
        ]
      }
    ];

    return metrics.map((provider, index) => (
      <div key={index} className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4 flex-1 min-w-[200px]">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-[#bff747]/20 flex items-center justify-center text-[#bff747] font-bold text-sm">
            {provider.icon}
          </div>
          <h3 className="ml-2 font-semibold text-[#bff747]">{provider.provider}</h3>
        </div>
        <div className="space-y-2">
          {provider.metrics.map((metric, idx) => (
            <div key={idx} className="flex justify-between items-center py-1 border-b border-[#bff747]/10 last:border-b-0">
              <div className="text-xs text-gray-400">{metric.label}</div>
              <div className="font-semibold text-[#bff747] text-sm">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-[#bff747] hover:text-[#a8e035] mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Back to Websites
      </button>

      {/* Main Content */}
      <div className="bg-[#1a1a1a] rounded-xl shadow-lg overflow-hidden border border-[#bff747]/30">
        {/* Header */}
        <div className="p-6 border-b border-[#bff747]/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center">
                <GlobeAltIcon className="h-8 w-8 text-[#bff747] mr-3" />
                <h1 className="text-2xl font-bold text-[#bff747]">{website.domain}</h1>
                <a 
                  href={`https://${website.domain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-gray-400 hover:text-[#bff747]"
                >
                  <LinkIcon className="h-5 w-5" />
                </a>
              </div>
              <p className="mt-2 text-gray-300">{website.siteDescription}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button 
                onClick={() => navigate(`/advertiser/order/${website._id}`)}
                className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center"
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Place Order
              </button>
              <button 
                onClick={handleAddToFavorites}
                disabled={loading}
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-[#bff747] font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center disabled:opacity-50 border border-[#bff747]/30"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-400 mr-2" />
                ) : (
                  <HeartOutlineIcon className="h-5 w-5 mr-2" />
                )}
                {isFavorite ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Website Information Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/30">
                <h2 className="text-lg font-semibold text-[#bff747] mb-4">Website Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-[#bff747] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="font-medium capitalize text-[#bff747]">
                        {website.allCategories && website.allCategories.length > 0 
                          ? website.allCategories.join(', ') 
                          : (website.category || 'Not specified')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <LanguageIcon className="h-5 w-5 text-[#bff747] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Language</p>
                      <p className="font-medium text-[#bff747]">{website.mainLanguage || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-[#bff747] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Country</p>
                      <p className="font-medium text-[#bff747]">{website.country || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ServerIcon className="h-5 w-5 text-[#bff747] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Link Type</p>
                      <p className="font-medium capitalize text-[#bff747]">{website.linkType || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 text-[#bff747] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Keywords</p>
                      <p className="font-medium text-[#bff747]">
                        {website.keywords && website.keywords.length > 0 
                          ? website.keywords.join(', ') 
                          : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/30">
              <h2 className="text-lg font-semibold text-[#bff747] mb-4">Performance</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-400">Rating</span>
                    <span className="text-sm font-medium text-[#bff747]">
                      {formatRating(website.statistics?.avgRating)}/5
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full bg-[#0c0c0c] rounded-full h-2">
                      <div 
                        className="bg-[#bff747] h-2 rounded-full" 
                        style={{ width: `${(website.statistics?.avgRating || 0) * 20}%` }}
                      ></div>
                    </div>
                    <div className="ml-2 flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={star} 
                          className={`h-4 w-4 ${star <= (website.statistics?.avgRating || 0) ? 'text-[#bff747] fill-current' : 'text-gray-600'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {website.statistics?.reviewCount || 0} reviews
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0c0c0c] p-3 rounded-lg border border-[#bff747]/30">
                    <p className="text-xs text-gray-400">Total Orders</p>
                    <p className="text-lg font-bold text-[#bff747]">
                      {website.statistics?.totalOrders || 0}
                    </p>
                  </div>
                  
                  <div className="bg-[#0c0c0c] p-3 rounded-lg border border-[#bff747]/30">
                    <p className="text-xs text-gray-400">Success Rate</p>
                    <p className="text-lg font-bold text-green-400">
                      {getSuccessRate(website.statistics) || 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Sections and Advertising Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#2a2a2a] rounded-lg p-5 border border-[#bff747]/30">
              <h3 className="text-lg font-semibold text-[#bff747] mb-3">Publishing Sections</h3>
              <p className="text-gray-300 text-sm">
                {website.publishingSections || 'Not specified'}
              </p>
            </div>
            
            <div className="bg-[#2a2a2a] rounded-lg p-5 border border-[#bff747]/30">
              <h3 className="text-lg font-semibold text-[#bff747] mb-3">Advertising Requirements</h3>
              <p className="text-gray-300 text-sm">
                {website.advertisingRequirements || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#bff747] mb-4">Pricing Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#2a2a2a] rounded-lg p-5 text-center border border-[#bff747]/30">
                <CurrencyDollarIcon className="h-8 w-8 text-[#bff747] mx-auto mb-3" />
                <h3 className="font-semibold text-[#bff747] mb-1">Publishing</h3>
                <p className="text-sm text-gray-400 mb-2">Standard guest post</p>
                <p className="text-2xl font-bold text-[#bff747]">
                  {formatPrice(website.publishingPrice || 0)}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-5 text-center border border-[#bff747]/30">
                <ChartBarIcon className="h-8 w-8 text-[#bff747] mx-auto mb-3" />
                <h3 className="font-semibold text-[#bff747] mb-1">Copywriting</h3>
                <p className="text-sm text-gray-400 mb-2">Professional content</p>
                <p className="text-2xl font-bold text-[#bff747]">
                  {formatPrice(website.copywritingPrice || 0)}
                </p>
              </div>
              <div className="bg-[#2a2a2a] rounded-lg p-5 text-center border border-[#bff747]/30">
                <TagIcon className="h-8 w-8 text-[#bff747] mx-auto mb-3" />
                <h3 className="font-semibold text-[#bff747] mb-1">Sensitive Topic Price</h3>
                <p className="text-sm text-gray-400 mb-2">For sensitive content</p>
                <p className="text-2xl font-bold text-[#bff747]">
                  {formatPrice(website.sensitiveContentExtraCharge || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* SEO Metrics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#bff747] mb-4 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-[#bff747]" />
              SEO Metrics
            </h2>
            <div className="flex flex-col gap-4">
              {/* Moz - Full width */}
              <div className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#bff747]/20 flex items-center justify-center text-[#bff747] font-bold text-sm">
                    M
                  </div>
                  <h3 className="ml-2 font-semibold text-[#bff747]">Moz</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">DA</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.domainAuthority || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">PA</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.pageAuthority || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">SS</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.spamScore || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Domain Age</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.domainAge || "N/A"}</div>
                  </div>
                </div>
              </div>
              
              {/* Ahrefs - Full width */}
              <div className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#bff747]/20 flex items-center justify-center text-[#bff747] font-bold text-sm">
                    A
                  </div>
                  <h3 className="ml-2 font-semibold text-[#bff747]">Ahrefs</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">DR</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.ahrefsDomainRating || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">UR</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.urlRating || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Traffic</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.ahrefsTraffic ? website.metrics.ahrefsTraffic.toLocaleString() : "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Keywords</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.ahrefsKeywords || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Referring Domains</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.referringDomains || "N/A"}</div>
                  </div>
                </div>
              </div>
              
              {/* Semrush - Full width */}
              <div className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#bff747]/20 flex items-center justify-center text-[#bff747] font-bold text-sm">
                    S
                  </div>
                  <h3 className="ml-2 font-semibold text-[#bff747]">Semrush</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">AS</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.semrushAuthorityScore || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Traffic</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.semrushTraffic ? website.metrics.semrushTraffic.toLocaleString() : "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Keywords</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.semrushKeywords || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Referring Domains</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.semrushReferringDomains || "N/A"}</div>
                  </div>
                </div>
              </div>
              
              {/* Majestic - Full width */}
              <div className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#bff747]/20 flex items-center justify-center text-[#bff747] font-bold text-sm">
                    Mj
                  </div>
                  <h3 className="ml-2 font-semibold text-[#bff747]">Majestic</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">TF</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.majesticTrustFlow || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">CF</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.majesticCitationFlow || "N/A"}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#1a1a1a] rounded border border-[#bff747]/20">
                    <div className="text-xs text-gray-400">Total Index</div>
                    <div className="font-semibold text-[#bff747] text-lg">{website.metrics?.majesticTotalIndex || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Charts */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#bff747] mb-4">Traffic Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4">
                <h3 className="font-medium text-[#bff747] mb-3">Organic Traffic</h3>
                <div className="h-64">
                  <canvas ref={trafficChartRef}></canvas>
                </div>
              </div>
              <div className="bg-[#2a2a2a] border border-[#bff747]/30 rounded-lg p-4">
                <h3 className="font-medium text-[#bff747] mb-3">Visibility Index</h3>
                <div className="h-64">
                  <canvas ref={visibilityChartRef}></canvas>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reviews */}
          {website.recentReviews && website.recentReviews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#bff747] mb-4">Recent Reviews</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {website.recentReviews.slice(0, 4).map((review, index) => (
                  <div key={index} className="bg-[#2a2a2a] rounded-lg p-4 border border-[#bff747]/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-[#bff747]">{review.advertiserName}</h3>
                        <p className="text-sm text-gray-400">Order #{review.orderId}</p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star} 
                            className={`h-4 w-4 ${star <= review.rating ? 'text-[#bff747] fill-current' : 'text-gray-600'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{review.comment}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(review.reviewedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Publisher */}
          <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#bff747]/30">
            <h2 className="text-lg font-semibold text-[#bff747] mb-2">Ready to Place an Order?</h2>
            <p className="text-gray-300 mb-4">Get in touch with the publisher for any questions before placing your order.</p>
            <button 
              onClick={handleContactPublisher}
              disabled={contactLoading}
              className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center w-full md:w-auto justify-center disabled:opacity-50"
            >
              {contactLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0c0c0c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Chat...
                </>
              ) : (
                <>
                  <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                  Contact Publisher
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteDetailsView;