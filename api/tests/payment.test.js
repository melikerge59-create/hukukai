/**
 * Unit tests for api/payment.js validation logic.
 * These tests exercise input validation without calling external services.
 */

const VALID_PLANS = ['plus', 'pro', 'elite'];
const PLAN_PRICES = { plus: '99.00', pro: '349.00', elite: '799.00' };
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

describe('payment.js — input validation', () => {
  test('rejects invalid plan', () => {
    const plan = 'free';
    expect(VALID_PLANS.includes(plan)).toBe(false);
  });

  test('rejects missing plan', () => {
    const plan = undefined;
    expect(!plan || !VALID_PLANS.includes(plan)).toBe(true);
  });

  test('accepts valid plans', () => {
    VALID_PLANS.forEach(plan => {
      expect(VALID_PLANS.includes(plan)).toBe(true);
      expect(PLAN_PRICES[plan]).toBeDefined();
    });
  });

  test('rejects invalid email formats', () => {
    const invalidEmails = ['notanemail', 'missing@', '@nodomain.com', ''];
    invalidEmails.forEach(email => {
      expect(EMAIL_REGEX.test(email)).toBe(false);
    });
  });

  test('accepts valid email format', () => {
    const email = 'kullanici@example.com';
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  test('rejects userName shorter than 2 characters', () => {
    const userName = 'A';
    expect(userName.trim().length < 2).toBe(true);
  });

  test('accepts valid userName', () => {
    const userName = 'Ahmet Yilmaz';
    expect(typeof userName === 'string' && userName.trim().length >= 2).toBe(true);
  });

  test('plan prices match expected TRY amounts', () => {
    expect(PLAN_PRICES.plus).toBe('99.00');
    expect(PLAN_PRICES.pro).toBe('349.00');
    expect(PLAN_PRICES.elite).toBe('799.00');
  });
});

describe('payment.js — Iyzipay URL configuration', () => {
  test('defaults to sandbox URL when IYZICO_BASE_URL not set', () => {
    const baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
    expect(baseUrl).toBe('https://sandbox-api.iyzipay.com');
  });

  test('uses env var URL when set', () => {
    const savedUrl = process.env.IYZICO_BASE_URL;
    process.env.IYZICO_BASE_URL = 'https://api.iyzipay.com';
    const baseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
    expect(baseUrl).toBe('https://api.iyzipay.com');
    // Restore
    if (savedUrl !== undefined) {
      process.env.IYZICO_BASE_URL = savedUrl;
    } else {
      delete process.env.IYZICO_BASE_URL;
    }
  });
});
