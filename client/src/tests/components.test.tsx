import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CourseImage } from '../components/course/CourseImage';

describe('UI Component Unit Tests', () => {
  it('renders Badge component with text', () => {
    render(<Badge variant="blue">WORKSHOP</Badge>);
    expect(screen.getByText('WORKSHOP')).toBeInTheDocument();
  });

  it('renders ProgressBar with percentage', () => {
    render(<ProgressBar progress={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders CourseImage with valid image', () => {
    render(
      <CourseImage
        course={{
          title: 'Generative AI & LLM Integration for Web Apps',
          thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
        }}
      />
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800');
  });

  it('renders stylized SkillForge domain fallback when image is empty', () => {
    render(
      <CourseImage
        course={{
          title: 'Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp',
          thumbnail: '',
        }}
      />
    );
    expect(screen.getByText('Docker, Kubernetes & AWS CI/CD Pipeline Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('SkillForge Masterclass')).toBeInTheDocument();
  });

  it('switches to domain fallback on image error', () => {
    render(
      <CourseImage
        course={{
          title: 'Advanced MongoDB Aggregation Pipelines',
          thumbnail: 'https://invalid-domain.com/broken.jpg',
        }}
      />
    );
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('Advanced MongoDB Aggregation Pipelines')).toBeInTheDocument();
  });
});
