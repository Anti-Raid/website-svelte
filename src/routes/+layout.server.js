import cookie from 'cookie';

export const load = ({ request, setHeaders }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '');

	return {
		user: cookies.auth
	};
};
