import React, { useState, useEffect } from 'react';
import { Plus, Filter, Globe, Calendar, Tag, ArrowRight, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { advertiserAPI } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

const ProjectsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get current user
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from the backend API
  useEffect(() => {
    console.log('Current user:', user);
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects from the backend API
      const response = await advertiserAPI.getProjects();
      
      console.log('Projects API response:', response);
      
      if (response.data && (response.data.ok || response.data.success)) {
        console.log('Projects data:', response.data.data);
        // Log each project to see the structure
        response.data.data.forEach((project, index) => {
          console.log(`Project ${index + 1}:`, project);
          console.log(`Project ${index + 1} ID:`, project._id);
          console.log(`Project ${index + 1} ID type:`, typeof project._id);
        });
        setProjects(response.data.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again later.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const ProjectCard = ({ project }) => {
    console.log('ProjectCard received project:', project);
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#333] hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-[#bff747] to-[#a8e035] rounded-lg flex items-center justify-center">
            <span className="text-[#0c0c0c] text-sm font-bold">P</span>
          </div>
          <h3 className="text-lg font-semibold text-[#bff747]">{project.title}</h3>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Globe className="w-4 h-4 text-[#bff747]" />
            <span>{project.website}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-[#bff747]" />
            <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Tag className="w-4 h-4 text-[#bff747]" />
            <span>{project.categories ? project.categories.join(', ') : 'N/A'}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <ArrowRight className="w-4 h-4 text-[#bff747]" />
            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs border border-green-500/30">
              {project.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#bff747] text-[#0c0c0c] px-3 py-1 rounded-lg text-sm font-medium">
              {project.stats?.finishedPosts || 0}
            </div>
            <span className="text-sm text-gray-300">Finished Posts</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#bff747] text-[#0c0c0c] px-3 py-1 rounded-lg text-sm font-medium">
              {project.stats?.activePosts || 0}
            </div>
            <span className="text-sm text-gray-300">Active Posts</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#bff747] text-[#0c0c0c] px-3 py-1 rounded-lg text-sm font-medium">
              {project.stats?.pendingReviews || 0}
            </div>
            <span className="text-sm text-gray-300">Pending Reviews</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-[#bff747] text-[#0c0c0c] px-3 py-1 rounded-lg text-sm font-medium">
              {project.stats?.totalOrders || 0}
            </div>
            <span className="text-sm text-gray-300">Total Orders</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-[#bff747] hover:bg-[#bff747]/20 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              // Use project.id instead of project._id since the virtual removes _id
              const projectId = project.id || project._id;
              console.log('Navigating to project details with ID:', projectId);
              console.log('Type of projectId:', typeof projectId);
              navigate(`/advertiser/projects/${projectId}`);
            }}
            className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            See Project
          </button>
        </div>
      </div>
    );
  };

  const NewProjectCard = () => (
    <div 
      onClick={() => navigate('/advertiser/projects/create')}
      className="bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#333] hover:shadow-md transition-all duration-200 flex items-center justify-center min-h-[400px] cursor-pointer group"
    >
      <div className="text-center">
        <div className="w-16 h-16 bg-[#bff747]/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:bg-[#bff747]/30 transition-colors">
          <Plus className="w-8 h-8 text-[#bff747]" />
        </div>
        <span className="text-lg font-medium text-[#bff747]">New Project</span>
      </div>
    </div>
  );

  // Refresh projects when component mounts or when needed
  useEffect(() => {
    // Check if there's a success message from project creation
    const locationState = window.history.state;
    if (locationState && locationState.message) {
      // Refresh projects list
      fetchProjects();
    }
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bff747]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#333] mb-8">
        <div className="text-center text-red-400">{error}</div>
        <div className="text-center mt-4">
          <button 
            onClick={fetchProjects}
            className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    // Removed the min-h-screen and background color that was conflicting with the layout
    <div className="w-full">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header Section */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 shadow-sm border border-[#333] mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#bff747] mb-3">My Projects</h1>
              <p className="text-gray-400">
                Create new projects to improve your SEO, link building, branded content, online reputation.
              </p>
            </div>
            <button 
              onClick={fetchProjects}
              className="bg-[#1a1a1a] text-[#bff747] px-4 py-2 rounded-lg border border-[#333] hover:bg-[#2a2a2a] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex justify-end mb-8">
          <div className="relative">
            <button
              onClick={() => navigate('/advertiser/projects/create')}
              className="flex items-center gap-3 bg-[#bff747] text-[#0c0c0c] px-4 py-3 rounded-xl shadow-sm hover:bg-[#a8e035] transition-all duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <NewProjectCard />
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>

        {/* Message when no projects exist */}
        {projects.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No projects found. Create your first project to get started.</p>
            <button 
              onClick={() => navigate('/advertiser/projects/create')}
              className="bg-[#bff747] hover:bg-[#a8e035] text-[#0c0c0c] px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* See More Section */}
        {projects.length > 0 && (
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/advertiser/projects/details')}
              className="flex items-center gap-2 text-[#bff747] hover:text-[#a8e035] font-medium transition-colors"
            >
              <span className="text-lg">See more</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsDashboard;