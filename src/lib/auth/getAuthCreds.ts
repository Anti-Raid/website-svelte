import { CreateUserSessionResponse } from '$lib/generated/types';
import logger from '../ui/logger';

export const getAuthCreds = () => {
	logger.info('Auth', 'Loading auth data');

	let token = localStorage.getItem('wistala');

	let data: CreateUserSessionResponse | null = null;

	if (token) {
		try {
			data = JSON.parse(token);
			if (data?.expiry) {
				let expiry = new Date(data.expiry);
				let current = new Date();
				if (expiry < current) {
					logger.info('Auth', 'Auth data expired');
					localStorage.removeItem('wistala');
					return null;
				}
			}

			if (!data?.user_id || !data?.token) {
				return null;
			}

			return data;
		} catch (err) {
			// User is not logged in
			logger.error('Layout', 'Auth data invalid', err);
		}
	}

	return null;
};
