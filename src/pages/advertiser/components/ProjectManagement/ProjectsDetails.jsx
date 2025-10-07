import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit, BarChart3, Tag, Globe, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { advertiserAPI } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

const ProjectsDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL params
  const { user } = useAuth(); // Get current user
  const chartRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch project details
  useEffect(() => {
    console.log('Project ID from route params:', id);
    console.log('Current user:', user);
    console.log('Type of id:', typeof id);
    
    // Check if id is undefined or invalid
    if (!id || id === 'undefined') {
      console.log('ERROR: No valid project ID provided');
      setError('No project ID provided');
      setLoading(false);
      return;
    }
    
    fetchProjectDetails(id);
  }, [id, user]);

  const fetchProjectDetails = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching project with ID:', projectId);
      
      // Fetch project details from the backend API
      const response = await advertiserAPI.getProject(projectId);
      
      console.log('Project API response:', response);
      
      if (response.data && (response.data.ok || response.data.success)) {
        setProject(response.data.data);
        console.log('Project data set:', response.data.data);
      } else {
        setError('Project not found');
        console.log('Project not found response:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      setError('Failed to load project details. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshProject = () => {
    setRefreshing(true);
    if (id) {
      fetchProjectDetails(id);
    }
  };

  // Chart data
  const visibilityMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const visibilityData = [0.1, 0.2, 0.4, 0.7, 0.6, 0.5, 0.7, 0.95, 0.7, 0.5, 0.4, 0.4];

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

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Pending', class: 'text-yellow-400' },
      'approved': { text: 'Approved', class: 'text-blue-400' },
      'in_progress': { text: 'In Progress', class: 'text-purple-400' },
      'completed': { text: 'Completed', class: 'text-green-400' },
      'delivered': { text: 'Delivered', class: 'text-green-400' },
      'cancelled': { text: 'Cancelled', class: 'text-red-400' },
      'revision_requested': { text: 'Revision Requested', class: 'text-orange-400' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'text-gray-400' };
    return <span className={`font-semibold ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6 max-w-md w-full">
          <div className="text-center">
            <h3 className="text-lg font-medium text-[#bff747]">Error</h3>
            <p className="mt-1 text-sm text-gray-400">{error}</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/advertiser/projects')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    console.log('No project data to display');
    return (
      <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center">
        <div className="bg-[#1a1a1a] rounded-lg border border-[#bff747]/30 p-6 max-w-md w-full">
          <div className="text-center">
            <h3 className="text-lg font-medium text-[#bff747]">Project not found</h3>
            <p className="mt-1 text-sm text-gray-400">No project details available.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/advertiser/projects')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[#0c0c0c] bg-[#bff747] hover:bg-[#a8e035] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bff747]"
              >
                Back to Projects
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('Rendering project details:', project);
  return (
    <div className="min-h-screen bg-[#0c0c0c] font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header Card */}
        <div className="mb-8 bg-[#1a1a1a] rounded-lg shadow-sm p-6 border border-[#333]">
          <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-xl font-normal text-[#bff747] mb-2">{project.title}</h1>
              <p className="text-gray-400">Visualize, control and grow your project, all from one place.</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={refreshProject}
                disabled={refreshing}
                className="flex items-center gap-2 bg-[#1a1a1a] text-[#bff747] px-4 py-2 rounded border border-[#333] hover:bg-[#2a2a2a] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={() => navigate('/advertiser/projects')}
                className="flex items-center gap-2 bg-[#bff747] text-[#0c0c0c] px-5 py-2 rounded border hover:bg-[#a8e035] transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 bg-[#1a1a1a] rounded-lg p-6 border border-[#333]">
          <div className="flex-1 border border-[#333] rounded-xl p-5">
            <div className="flex justify-between items-center mb-5">
              <p className="text-[#bff747] text-lg">{project.title}</p>
              <p className="text-[#bff747]">{project.website}</p>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <Tag size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Categories:</p>
                <p className="text-gray-300">{project.categories ? project.categories.join(', ') : 'N/A'}</p>
              </div>
              <div className="flex items-center gap-5">
                <Globe size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Created Date:</p>
                <p className="text-gray-300">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex items-center gap-5">
                <TrendingUp size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Status:</p>
                <p className="text-gray-300">{project.status}</p>
              </div>
              <div className="flex items-center gap-5">
                <BarChart3 size={18} className="text-[#bff747]" />
                <p className="text-gray-400">Budget:</p>
                <p className="text-gray-300">${project.budget?.toFixed(2) || '0.00'}</p>
              </div>
              {project.description && (
                <div className="flex items-start gap-5">
                  <Edit size={18} className="text-[#bff747] mt-1" />
                  <div>
                    <p className="text-gray-400">Description:</p>
                    <p className="text-gray-300">{project.description}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-80 border border-[#333] rounded-xl p-5">
            <p className="text-[#bff747] text-lg mb-4">Project Stats</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Finished Posts</p>
                <p className="text-gray-300">{project.stats?.finishedPosts || 0}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Active Posts</p>
                <p className="text-gray-300">{project.stats?.activePosts || 0}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-gray-400">Pending Reviews</p>
                <p className="text-gray-300">{project.stats?.pendingReviews || 0}</p>
              </div>
              <div className="flex justify-between text-sm border-b border-[#bff747] pb-3">
                <p className="text-gray-400">Total Orders</p>
                <p className="text-gray-300">{project.stats?.totalOrders || 0}</p>
              </div>
              <div className="flex justify-between text-sm">
                <p className="text-[#bff747] font-semibold">Budget</p>
                <p className="text-gray-300">${project.budget?.toFixed(2) || '0.00'}</p>
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
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[#bff747] text-lg font-medium">Project Orders</h3>
              <p className="text-gray-400 text-sm">{project.stats?.totalOrders || 0} orders</p>
            </div>
            
            <div className="text-center py-8 text-gray-400">
              <p>No orders found for this project</p>
              <p className="text-sm mt-2">Orders will appear here once you start placing orders for this project.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsDetails;