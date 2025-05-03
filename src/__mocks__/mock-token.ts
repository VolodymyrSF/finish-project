export const mockTokenService = {
    signToken: jest.fn(async (payload: any, expiresIn: string, type: string) => {
      return `fakeToken-${payload.email || payload.managerId}-${type}`;
    }),
    verifyToken: jest.fn(async (token: string, type: string) => {
      if (token.includes('INVALID')) {
        throw new Error('Invalid token');
      }
      if (type === 'RESET') {
        return { email: 'john@example.com', type: 'RESET' };
      }
      if (type === 'ACTIVATE') {
        return { managerId: '2', email: 'john@example.com', type: 'ACTIVATE' };
      }
      throw new Error('Unknown token type');
    }),
  };
  