// Mock socket.io-client for Jest tests
const mockSocket = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  connected: false,
  id: 'mock-socket-id',
};

module.exports = jest.fn(() => mockSocket);
module.exports.default = jest.fn(() => mockSocket);
