import { describe, it, expect } from 'vitest'
import { isValidEmail, validateSignup } from '@/lib/validation'

describe('Validation', () => {
  describe('isValidEmail', () => {
    it('should accept valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
    })

    it('should reject invalid email', () => {
      expect(isValidEmail('not-an-email')).toBe(false)
    })
  })

  describe('validateSignup', () => {
    it('should validate correct signup data', () => {
      const result = validateSignup({
        email: 'test@example.com',
        password: '123456',
        confirmPassword: '123456'
      })
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors).length).toBe(0)
    })

    it('should reject mismatched passwords', () => {
      const result = validateSignup({
        email: 'test@example.com',
        password: '123456',
        confirmPassword: '654321'
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.confirmPassword).toBeDefined()
    })

    it('should reject short password', () => {
      const result = validateSignup({
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.password).toBeDefined()
    })
  })
})
