import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { z } from 'zod';
import { useValidation } from './useValidation';

describe('useValidation', () => {
  const emailSchema = z.string().email('Invalid email format');
  const minLengthSchema = z.string().min(3, 'Minimum 3 characters');

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useValidation());

    expect(result.current.message).toBe('');
    expect(result.current.statusClass).toBe('');
  });

  it('should validate successfully with valid input', () => {
    const { result } = renderHook(() => useValidation(emailSchema));

    act(() => {
      result.current.validate('test@example.com');
    });

    expect(result.current.message).toBe('');
    expect(result.current.statusClass).toBe('success');
  });

  it('should show error with invalid input', () => {
    const { result } = renderHook(() => useValidation(emailSchema));

    act(() => {
      result.current.validate('invalid-email');
    });

    expect(result.current.message).toBe('Invalid email format');
    expect(result.current.statusClass).toBe('danger');
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useValidation(emailSchema));

    act(() => {
      result.current.validate('invalid-email');
    });

    expect(result.current.statusClass).toBe('danger');

    act(() => {
      result.current.reset();
    });

    expect(result.current.message).toBe('');
    expect(result.current.statusClass).toBe('');
  });

  it('should not validate when value is empty', () => {
    const { result } = renderHook(() => useValidation(emailSchema));

    act(() => {
      result.current.validate('');
    });

    expect(result.current.message).toBe('');
    expect(result.current.statusClass).toBe('');
  });

  it('should not validate when validator is undefined', () => {
    const { result } = renderHook(() => useValidation());

    act(() => {
      result.current.validate('any value');
    });

    expect(result.current.message).toBe('');
    expect(result.current.statusClass).toBe('');
  });

  it('should work with min length validation', () => {
    const { result } = renderHook(() => useValidation(minLengthSchema));

    act(() => {
      result.current.validate('ab');
    });

    expect(result.current.message).toBe('Minimum 3 characters');
    expect(result.current.statusClass).toBe('danger');

    act(() => {
      result.current.validate('abc');
    });

    expect(result.current.message).toBe('');
    expect(result.current.statusClass).toBe('success');
  });
});
