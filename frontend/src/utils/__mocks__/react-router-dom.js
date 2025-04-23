export const mockNavigate = jest.fn()

export function useNavigate() {
  return mockNavigate
}

export function MemoryRouter({ children }) {
  return children
}