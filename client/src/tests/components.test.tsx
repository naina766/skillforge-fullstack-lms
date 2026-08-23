import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';

describe('UI Component Unit Tests', () => {
  it('renders Badge component with text', () => {
    render(<Badge variant="blue">WORKSHOP</Badge>);
    expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
  });

  it('renders ProgressBar with percentage', () => {
    render(<ProgressBar progress={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});
