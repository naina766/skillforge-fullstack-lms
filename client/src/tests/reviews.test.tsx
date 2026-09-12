import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StarRating } from '../components/reviews/StarRating';
import { CourseRatingSummary } from '../components/reviews/CourseRatingSummary';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { ReviewForm } from '../components/reviews/ReviewForm';
import { Review } from '../types';

describe('Course Rating & Review System - Frontend Component Unit Tests', () => {
  it('1. StarRating renders 5 stars and displays correct numeric rating', () => {
    render(<StarRating rating={4.9} maxRating={5} showNumeric />);

    expect(screen.getByText('4.9')).toBeDefined();
    const starButtons = screen.getAllByRole('button');
    expect(starButtons.length).toBe(5);
  });

  it('2. StarRating fires onRatingChange when interactive', () => {
    const handleRatingChange = vi.fn();
    render(<StarRating rating={3} interactive onRatingChange={handleRatingChange} />);

    const starButtons = screen.getAllByRole('button');
    fireEvent.click(starButtons[4]); // Click 5th star
    expect(handleRatingChange).toHaveBeenCalledWith(5);
  });

  it('3. CourseRatingSummary correctly renders average, total count, and distribution', () => {
    const mockSummary = {
      ratingAverage: 4.9,
      ratingCount: 31,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 3,
        5: 28,
      },
    };

    render(<CourseRatingSummary summary={mockSummary} />);

    expect(screen.getByText('4.9')).toBeDefined();
    expect(screen.getByText('31 verified reviews')).toBeDefined();
    expect(screen.getByText('(28)')).toBeDefined();
    expect(screen.getByText('(3)')).toBeDefined();
  });

  it('4. ReviewCard displays student name, verified badge, rating, and comment', () => {
    const mockReview: Review = {
      _id: 'rev_123',
      course: 'course_123',
      student: {
        id: 'stu_1',
        _id: 'stu_1',
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        role: 'STUDENT',
        skills: ['React'],
        interests: ['AI'],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      rating: 5,
      comment: 'Outstanding course on Gemini API and prompt engineering!',
      isModerated: true,
      createdAt: new Date('2026-08-15').toISOString(),
    };

    render(<ReviewCard review={mockReview} />);

    expect(screen.getByText('Sarah Connor')).toBeDefined();
    expect(screen.getByText('Verified Learner')).toBeDefined();
    expect(screen.getByText('"Outstanding course on Gemini API and prompt engineering!"')).toBeDefined();
  });

  it('5. ReviewForm handles validation and submission', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ReviewForm onSubmit={handleSubmit} courseTitle="Generative AI Masterclass" />);

    expect(screen.getByText('How would you rate this course?')).toBeDefined();
    expect(screen.getByText('Generative AI Masterclass')).toBeDefined();

    const textarea = screen.getByPlaceholderText(/Share your experience with other students/i);
    fireEvent.change(textarea, { target: { value: 'Great real-world architectures!' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Review/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      rating: 5,
      comment: 'Great real-world architectures!',
    });
  });
});
