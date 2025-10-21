import { render, screen } from '@testing-library/react';

describe('Sample Test', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('renders a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});