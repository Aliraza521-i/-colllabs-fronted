import React, { createContext, useContext, useState, useEffect } from 'react';
import { qualityAPI } from '../services/api';

const QualityContext = createContext();

export const useQuality = () => {
  const context = useContext(QualityContext);
  if (!context) {
    throw new Error('useQuality must be used within a QualityProvider');
  }
  return context;
};

export const QualityProvider = ({ children }) => {
  const [qualityChecks, setQualityChecks] = useState([]);
  const [selectedQualityCheck, setSelectedQualityCheck] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load quality checks
  const loadQualityChecks = async (params = {}) => {
    try {
      setLoading(true);
      const response = await qualityAPI.getQualityChecks(params);
      setQualityChecks(response.data.qualityChecks || []);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to load quality checks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load quality check details
  const loadQualityCheck = async (qualityCheckId) => {
    try {
      setLoading(true);
      const response = await qualityAPI.getQualityCheck(qualityCheckId);
      setSelectedQualityCheck(response.data.qualityCheck);
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to load quality check');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create quality check
  const createQualityCheck = async (data) => {
    try {
      setLoading(true);
      const response = await qualityAPI.createQualityCheck(data);
      setQualityChecks(prev => [response.data.qualityCheck, ...prev]);
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to create quality check');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Run automated checks
  const runAutomatedChecks = async (qualityCheckId, content) => {
    try {
      setLoading(true);
      const response = await qualityAPI.runAutomatedChecks(qualityCheckId, { content });
      // Update the quality check in state
      setQualityChecks(prev => 
        prev.map(qc => 
          qc._id === qualityCheckId ? response.data.qualityCheck : qc
        )
      );
      if (selectedQualityCheck && selectedQualityCheck._id === qualityCheckId) {
        setSelectedQualityCheck(response.data.qualityCheck);
      }
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to run automated checks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Assign reviewer
  const assignReviewer = async (qualityCheckId) => {
    try {
      setLoading(true);
      const response = await qualityAPI.assignReviewer(qualityCheckId);
      // Update the quality check in state
      setQualityChecks(prev => 
        prev.map(qc => 
          qc._id === qualityCheckId ? response.data.qualityCheck : qc
        )
      );
      if (selectedQualityCheck && selectedQualityCheck._id === qualityCheckId) {
        setSelectedQualityCheck(response.data.qualityCheck);
      }
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to assign reviewer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Start manual review
  const startManualReview = async (qualityCheckId) => {
    try {
      setLoading(true);
      const response = await qualityAPI.startManualReview(qualityCheckId);
      // Update the quality check in state
      setQualityChecks(prev => 
        prev.map(qc => 
          qc._id === qualityCheckId ? response.data.qualityCheck : qc
        )
      );
      if (selectedQualityCheck && selectedQualityCheck._id === qualityCheckId) {
        setSelectedQualityCheck(response.data.qualityCheck);
      }
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to start manual review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Complete manual review
  const completeManualReview = async (qualityCheckId, data) => {
    try {
      setLoading(true);
      const response = await qualityAPI.completeManualReview(qualityCheckId, data);
      // Update the quality check in state
      setQualityChecks(prev => 
        prev.map(qc => 
          qc._id === qualityCheckId ? response.data.qualityCheck : qc
        )
      );
      if (selectedQualityCheck && selectedQualityCheck._id === qualityCheckId) {
        setSelectedQualityCheck(response.data.qualityCheck);
      }
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to complete manual review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add comment
  const addComment = async (qualityCheckId, text) => {
    try {
      setLoading(true);
      const response = await qualityAPI.addComment(qualityCheckId, { text });
      // Update the quality check in state
      setQualityChecks(prev => 
        prev.map(qc => 
          qc._id === qualityCheckId ? response.data.qualityCheck : qc
        )
      );
      if (selectedQualityCheck && selectedQualityCheck._id === qualityCheckId) {
        setSelectedQualityCheck(response.data.qualityCheck);
      }
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit revision
  const submitRevision = async (qualityCheckId, changes) => {
    try {
      setLoading(true);
      const response = await qualityAPI.submitRevision(qualityCheckId, { changes });
      // Update the quality check in state
      setQualityChecks(prev => 
        prev.map(qc => 
          qc._id === qualityCheckId ? response.data.qualityCheck : qc
        )
      );
      if (selectedQualityCheck && selectedQualityCheck._id === qualityCheckId) {
        setSelectedQualityCheck(response.data.qualityCheck);
      }
      return response.data.qualityCheck;
    } catch (err) {
      setError(err.message || 'Failed to submit revision');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load quality templates
  const loadTemplates = async (category = null) => {
    try {
      setLoading(true);
      const params = category ? { category } : {};
      const response = await qualityAPI.getQualityTemplates(params);
      setTemplates(response.data.templates || []);
      return response.data.templates;
    } catch (err) {
      setError(err.message || 'Failed to load templates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create quality template
  const createTemplate = async (data) => {
    try {
      setLoading(true);
      const response = await qualityAPI.createQualityTemplate(data);
      setTemplates(prev => [response.data.template, ...prev]);
      return response.data.template;
    } catch (err) {
      setError(err.message || 'Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update quality template
  const updateTemplate = async (templateId, data) => {
    try {
      setLoading(true);
      const response = await qualityAPI.updateQualityTemplate(templateId, data);
      setTemplates(prev => 
        prev.map(template => 
          template._id === templateId ? response.data.template : template
        )
      );
      return response.data.template;
    } catch (err) {
      setError(err.message || 'Failed to update template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete quality template
  const deleteTemplate = async (templateId) => {
    try {
      setLoading(true);
      await qualityAPI.deleteQualityTemplate(templateId);
      setTemplates(prev => prev.filter(template => template._id !== templateId));
    } catch (err) {
      setError(err.message || 'Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load my quality checks (for reviewers)
  const loadMyQualityChecks = async (params = {}) => {
    try {
      setLoading(true);
      const response = await qualityAPI.getMyQualityChecks(params);
      setQualityChecks(response.data.qualityChecks || []);
      return response.data.qualityChecks;
    } catch (err) {
      setError(err.message || 'Failed to load my quality checks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    qualityChecks,
    selectedQualityCheck,
    templates,
    reviewers,
    loading,
    error,
    
    // Actions
    loadQualityChecks,
    loadQualityCheck,
    createQualityCheck,
    runAutomatedChecks,
    assignReviewer,
    startManualReview,
    completeManualReview,
    addComment,
    submitRevision,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    loadMyQualityChecks,
    clearError
  };

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  );
};