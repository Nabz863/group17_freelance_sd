export default {
    from: jest.fn().mockImplementation(() =>
      Promise.resolve({ data: [] })
    ),
  };