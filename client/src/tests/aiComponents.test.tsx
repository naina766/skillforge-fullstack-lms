import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AIMentorEmptyState } from '../components/ai/AIMentorEmptyState';
import { ChatComposer } from '../components/ai/ChatComposer';
import { CareerAssessmentPanel } from '../components/ai/CareerAssessmentPanel';
import { SkillGapBadges } from '../components/ai/SkillGapBadges';
import { LearningPathTimeline } from '../components/ai/LearningPathTimeline';
import { NextActionCard } from '../components/ai/NextActionCard';

describe('AI Mentor UI Component Test Suite', () => {
  it('1. AIMentorEmptyState renders headline and triggers prompt selection', () => {
    const handleSelectPrompt = vi.fn();
    render(<AIMentorEmptyState onSelectPrompt={handleSelectPrompt} />);

    expect(screen.getByText("Build the career you're aiming for.")).toBeInTheDocument();

    const mernCard = screen.getByText('Build my MERN roadmap');
    expect(mernCard).toBeInTheDocument();

    fireEvent.click(mernCard);
    expect(handleSelectPrompt).toHaveBeenCalledWith('Create a comprehensive MERN stack career roadmap for me.');
  });

  it('2. ChatComposer handles user typing, char count, and sending prompts', () => {
    const handleSendPrompt = vi.fn();
    render(<ChatComposer onSendPrompt={handleSendPrompt} isPending={false} />);

    const textarea = screen.getByPlaceholderText(/Ask AI Career Mentor anything/i);
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Recommend Node.js courses' } });
    expect(screen.getByText(/\/1000/)).toBeInTheDocument();

    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);

    expect(handleSendPrompt).toHaveBeenCalledWith('Recommend Node.js courses');
  });

  it('3. CareerAssessmentPanel renders target role and level badge', () => {
    const assessment = { level: 'INTERMEDIATE', targetRole: 'Senior Backend Engineer' };
    render(<CareerAssessmentPanel assessment={assessment} />);

    expect(screen.getByText('Senior Backend Engineer')).toBeInTheDocument();
    expect(screen.getByText('INTERMEDIATE')).toBeInTheDocument();
  });

  it('4. SkillGapBadges renders missing skill gap pills', () => {
    const gaps = ['Docker', 'JWT Session Security', 'MongoDB Indexing'];
    render(<SkillGapBadges gaps={gaps} />);

    expect(screen.getByText('Docker')).toBeInTheDocument();
    expect(screen.getByText('JWT Session Security')).toBeInTheDocument();
    expect(screen.getByText('MongoDB Indexing')).toBeInTheDocument();
  });

  it('5. LearningPathTimeline renders numbered roadmap phases', () => {
    const phases = [
      { phase: 1, title: 'TypeScript Foundations', skills: ['TypeScript', 'Generics'] },
      { phase: 2, title: 'Node.js Architecture', skills: ['Express', 'MongoDB'] },
    ];
    render(<LearningPathTimeline phases={phases} />);

    expect(screen.getByText('PHASE 01')).toBeInTheDocument();
    expect(screen.getByText('TypeScript Foundations')).toBeInTheDocument();
    expect(screen.getByText('PHASE 02')).toBeInTheDocument();
    expect(screen.getByText('Node.js Architecture')).toBeInTheDocument();
  });

  it('6. NextActionCard renders immediate next step callout', () => {
    const actionText = 'Enroll in the Node.js Microservices workshop';
    render(<NextActionCard actionText={actionText} />);

    expect(screen.getByText('Enroll in the Node.js Microservices workshop')).toBeInTheDocument();
    expect(screen.getByText('Immediate Next Best Action')).toBeInTheDocument();
  });
});
