import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { z } from 'zod';
import Input from './input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input value="" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display value', () => {
    render(<Input value="test value" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveValue('test value');
  });

  it('should call onChange when typing', () => {
    const handleChange = vi.fn();
    render(<Input value="" onChange={handleChange} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should have aria-invalid when validation fails', async () => {
    const emailSchema = z.string().email('Invalid email');
    render(<Input value="invalid" validator={emailSchema} onChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('should show validation error message', async () => {
    const emailSchema = z.string().email('Invalid email format');
    render(<Input value="invalid" validator={emailSchema} onChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email format');
    });
  });

  it('should have success class when validation passes', async () => {
    const emailSchema = z.string().email('Invalid email');
    render(<Input value="test@example.com" validator={emailSchema} onChange={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole('textbox')).toHaveClass('success');
    });
  });

  it('should render with icon', () => {
    const { container } = render(<Input value="" withIcon="icon-search" onChange={() => {}} />);

    expect(container.querySelector('.icon-search')).toBeInTheDocument();
  });

  it('should render with right icon', () => {
    const { container } = render(<Input value="" withRightIcon="icon-check" onChange={() => {}} />);

    expect(container.querySelector('.icon-check')).toBeInTheDocument();
  });

  it('should render with unit', () => {
    render(<Input value="100" unit="원" onChange={() => {}} />);

    expect(screen.getByText('원')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Input value="" className="custom-class" onChange={() => {}} />);

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should support aria-label', () => {
    render(<Input value="" aria-label="Search input" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Search input');
  });

  it('should support placeholder', () => {
    render(<Input value="" placeholder="Enter text..." onChange={() => {}} />);

    expect(screen.getByPlaceholderText('Enter text...')).toBeInTheDocument();
  });

  it('should support disabled state', () => {
    render(<Input value="" disabled onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
