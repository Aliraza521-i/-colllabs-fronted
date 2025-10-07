import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../../services/api';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all advertiser projects from the backend
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProjects({
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined
      });
      
      if (response.data && (response.data.ok || response.data.success)) {
        console.log('Setting projects:', response.data.data);
        setProjects(response.data.data);
      } else {
        console.log('No projects data or not success/ok');
        setProjects([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again later.');
      setLoading(false);
    }
  };

  const handleProjectSelect = async (project) => {
    try {
      // Fetch detailed project information
      const response = await adminAPI.getProject(project.id || project._id);
      if (response.data && (response.data.ok || response.data.success)) {
        setSelectedProject(response.data.data);
      } else {
        setSelectedProject(project); // Fallback to basic project data
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
      setSelectedProject(project); // Fallback to basic project data
    }
  };

  const handleBackToList = () => {
    setSelectedProject(null);
  };

  const handleRefresh = async () => {
    await fetchProjects();
    if (selectedProject) {
      // Refresh the selected project details as well
      try {
        const response = await adminAPI.getProject(selectedProject.id || selectedProject._id);
        if (response.data && (response.data.ok || response.data.success)) {
          setSelectedProject(response.data.data);
        }
      } catch (err) {
        console.error('Failed to refresh project details:', err);
      }
    }
  };

  // Filter projects based on search term and status (for client-side filtering if needed)
  const filteredProjects = projects.filter(project => {
    // Handle different data structures
    const title = project.title || '';
    const website = project.website || project.targetUrl || '';
    const categories = project.categories || (project.category ? [project.category] : []);
    const status = project.status || 'active';
    
    // Debug logging
    console.log('Filtering project:', { project, title, website, categories, status, searchTerm, filterStatus });
    
    const matchesSearch = searchTerm === '' || 
                         title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         website.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus.toLowerCase();
    
    const result = matchesSearch && matchesStatus;
    console.log('Filter result:', result);
    return result;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all advertiser projects and their details
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {selectedProject ? (
        <ProjectDetails 
          project={selectedProject} 
          onBack={handleBackToList}
          onRefresh={handleRefresh}
        />
      ) : (
        <div>
          <div>Projects count: {filteredProjects.length}</div>
          <div>Search term: {searchTerm}</div>
          <div>Filter status: {filterStatus}</div>
          <ProjectList 
            projects={filteredProjects}
            onSelectProject={handleProjectSelect}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            onRefresh={handleRefresh}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;