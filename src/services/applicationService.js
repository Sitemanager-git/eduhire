/**
 * Application Service - Job Application Management
 */

import { applicationAPI } from './api';

const applicationService = {
    async submitApplication(jobId, coverLetter) {
        try {
            const response = await applicationAPI.submit(jobId, { coverLetter });
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to submit application');
        }
    },

    async getMyApplications(params = {}) {
        try {
            const response = await applicationAPI.getAll(params);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch applications');
        }
    },

    async getReceivedApplications(params = {}) {
        try {
            const response = await applicationAPI.getReceived(params);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch received applications');
        }
    },

    async updateApplicationStatus(applicationId, status) {
        try {
            const response = await applicationAPI.updateStatus(applicationId, status);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to update application status');
        }
    },

    handleError(error, defaultMessage) {
        let message = defaultMessage;

        if (error.response?.data) {
            const { error: apiError, message: apiMessage } = error.response.data;
            message = apiError || apiMessage || defaultMessage;
        }

        return new Error(message);
    }
};

export default applicationService;