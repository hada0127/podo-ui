import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './button';

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Loading</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should have aria-busy when loading', () => {
    render(<Button loading>Loading</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('should have aria-disabled when disabled', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('should show loading icon when loading', () => {
    render(<Button loading>Loading</Button>);

    expect(screen.getByRole('button').querySelector('.icon-loading')).toBeInTheDocument();
  });

  it('should apply theme class', () => {
    render(<Button theme="primary">Primary</Button>);

    expect(screen.getByRole('button')).toHaveClass('primary');
  });

  it('should apply variant class', () => {
    render(<Button variant="border">Border</Button>);

    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('should apply size class', () => {
    render(<Button size="lg">Large</Button>);

    expect(screen.getByRole('button')).toHaveClass('lg');
  });

  it('should render left icon', () => {
    render(<Button icon="icon-plus">Add</Button>);

    expect(screen.getByRole('button').querySelector('.icon-plus')).toBeInTheDocument();
  });

  it('should render right icon', () => {
    render(<Button rightIcon="icon-arrow-right">Next</Button>);

    expect(screen.getByRole('button').querySelector('.icon-arrow-right')).toBeInTheDocument();
  });

  it('should not render icons when loading', () => {
    render(<Button loading icon="icon-plus" rightIcon="icon-arrow-right">Loading</Button>);

    expect(screen.getByRole('button').querySelector('.icon-plus')).not.toBeInTheDocument();
    expect(screen.getByRole('button').querySelector('.icon-arrow-right')).not.toBeInTheDocument();
  });
});
