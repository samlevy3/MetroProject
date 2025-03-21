import { render, screen } from '@testing-library/react';
import MetroStatus from '@/components/MetroStatus';

describe('MetroStatus', () => {
  it('shows loading state initially', () => {
    render(<MetroStatus />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
}); 