const mockSupabaseClient = {
  from: jest.fn().mockImplementation(() => Promise.resolve({ data: [] })),
};

export default mockSupabaseClient;
