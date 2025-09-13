// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock axios to avoid ESM transform issues in CRA Jest
jest.mock('axios', () => ({
	__esModule: true,
	default: {
		create: () => ({
			interceptors: { request: { use: () => {} }, response: { use: () => {} } },
			get: jest.fn(() => Promise.resolve({ data: {} })),
			post: jest.fn(() => Promise.resolve({ data: {} })),
			put: jest.fn(() => Promise.resolve({ data: {} })),
			delete: jest.fn(() => Promise.resolve({ data: {} }))
		})
	}
}));
