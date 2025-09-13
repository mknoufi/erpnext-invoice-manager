// Mock @tanstack/react-query for Jest tests
const mockQueryClient = {
  getQueryData: jest.fn(),
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
  refetchQueries: jest.fn(),
  clear: jest.fn(),
};

const mockUseQuery = jest.fn(() => ({
  data: undefined,
  error: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  refetch: jest.fn(),
}));

const mockUseMutation = jest.fn(() => ({
  mutate: jest.fn(),
  mutateAsync: jest.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  error: null,
  data: undefined,
}));

module.exports = {
  QueryClient: jest.fn(() => mockQueryClient),
  QueryClientProvider: ({ children }) => children,
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useQueryClient: jest.fn(() => mockQueryClient),
};
