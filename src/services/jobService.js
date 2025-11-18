/**
 * Job Service - Centralized Job Management
 */

import api, { jobAPI, applicationAPI } from './api';

const jobService = {
    async createJob(jobData) {
        try {
            const response = await jobAPI.create(jobData);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to create job');
        }
    },

    async getJobs(params = {}) {
        try {
            const response = await jobAPI.search(params);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch jobs');
        }
    },

    async getJobDetails(jobId) {
        try {
            const response = await jobAPI.getDetails(jobId);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch job details');
        }
    },

    async getMyJobs(params = {}) {
        try {
            const response = await jobAPI.getMyJobs(params);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch your jobs');
        }
    },

    async updateJob(jobId, jobData) {
        try {
            const response = await jobAPI.update(jobId, jobData);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to update job');
        }
    },

    async deleteJob(jobId) {
        try {
            const response = await jobAPI.delete(jobId);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to delete job');
        }
    },

    async duplicateJob(jobId) {
        try {
            const response = await jobAPI.duplicate(jobId);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to duplicate job');
        }
    },

    async getSimilarJobs(jobId) {
        try {
            const response = await jobAPI.getSimilar(jobId);
            return response;
        } catch (error) {
            console.warn('Could not fetch similar jobs');
            return { data: { similarJobs: [] } };
        }
    },

    async getApplicants(jobId, params = {}) {
        try {
            const response = await applicationAPI.getByJob(jobId, params);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch applicants');
        }
    },

    async exportApplicants(jobId, format = 'csv') {
        try {
            const response = await applicationAPI.exportApplicants(jobId, format);
            return response;
        } catch (error) {
            if (error.response?.data?.upgrade_required) {
                throw new Error('Export requires premium subscription');
            }
            throw this.handleError(error, 'Failed to export applicants');
        }
    },

    handleError(error, defaultMessage) {
        let message = defaultMessage;

        if (error.response?.data) {
            const { error: apiError, message: apiMessage } = error.response.data;
            message = apiError || apiMessage || defaultMessage;
        }

        const enhancedError = new Error(message);
        enhancedError.response = error.response;
        return enhancedError;
    }
};

export default jobService;