import { Test, TestingModule } from '@nestjs/testing';
import { CaptchaService } from './captcha.service';

describe('CaptchaService', () => {
  let service: CaptchaService;
  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CaptchaService],
    }).compile();

    service = module.get<CaptchaService>(CaptchaService);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCaptcha', () => {
    it('1. should generate valid CAPTCHA challenge with ID, base64 SVG image, and 300s TTL', () => {
      const captcha = service.generateCaptcha();
      expect(captcha).toHaveProperty('captchaId');
      expect(captcha).toHaveProperty('image');
      expect(captcha).toHaveProperty('expiresIn', 300);
      expect(captcha.captchaId).toMatch(/^cpt-\d+-[a-f0-9]+$/);
      expect(captcha.image).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('2. should increment internal challenge storage count on generation', () => {
      const before = service.getChallengeCount();
      service.generateCaptcha();
      expect(service.getChallengeCount()).toBe(before + 1);
    });
  });

  describe('verifyCaptcha', () => {
    it('3. should reject missing captchaId or answer', () => {
      const result1 = service.verifyCaptcha('', 'K7P4X');
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Please enter the CAPTCHA.');

      const result2 = service.verifyCaptcha('cpt-123', '');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Please enter the CAPTCHA.');
    });

    it('4. should reject non-existent or expired captchaId', () => {
      const result = service.verifyCaptcha('cpt-non-existent-999', 'K7P4X');
      expect(result.success).toBe(false);
      expect(result.error).toBe('CAPTCHA expired. Please refresh and try again.');
    });

    it('5. should succeed with correct answer and case-insensitive matching', () => {
      // Access internal storage for deterministic test
      const captcha = service.generateCaptcha();
      const internalChallenge = (service as any).challenges.get(captcha.captchaId);

      // Verify that testing with correct answer matches
      const testCode = 'K7P4X';
      internalChallenge.hashedAnswer = (service as any).hashAnswer(testCode, internalChallenge.salt);

      // Test lowercase input matching uppercase challenge
      const result = service.verifyCaptcha(captcha.captchaId, 'k7p4x');
      expect(result.success).toBe(true);
    });

    it('6. should reject incorrect answer and increment failedAttempts', () => {
      const captcha = service.generateCaptcha();
      const internalChallenge = (service as any).challenges.get(captcha.captchaId);
      internalChallenge.hashedAnswer = (service as any).hashAnswer('A6N4Q', internalChallenge.salt);

      const result = service.verifyCaptcha(captcha.captchaId, 'WRONG');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Incorrect CAPTCHA. Please try again.');
      expect(internalChallenge.failedAttempts).toBe(1);
    });

    it('7. should enforce single-use protection (cannot reuse solved CAPTCHA)', () => {
      const captcha = service.generateCaptcha();
      const internalChallenge = (service as any).challenges.get(captcha.captchaId);
      internalChallenge.hashedAnswer = (service as any).hashAnswer('P3X9K', internalChallenge.salt);

      // First solve -> Succeeded
      const result1 = service.verifyCaptcha(captcha.captchaId, 'P3X9K');
      expect(result1.success).toBe(true);

      // Second attempt with same ID -> Rejected
      const result2 = service.verifyCaptcha(captcha.captchaId, 'P3X9K');
      expect(result2.success).toBe(false);
    });

    it('8. should invalidate CAPTCHA and block after 5 failed attempts', () => {
      const captcha = service.generateCaptcha();
      const internalChallenge = (service as any).challenges.get(captcha.captchaId);
      internalChallenge.hashedAnswer = (service as any).hashAnswer('8M2QW', internalChallenge.salt);

      // 4 incorrect attempts
      for (let i = 0; i < 4; i++) {
        const res = service.verifyCaptcha(captcha.captchaId, `BAD${i}`);
        expect(res.success).toBe(false);
        expect(res.error).toBe('Incorrect CAPTCHA. Please try again.');
      }

      // 5th incorrect attempt -> Invalidate
      const res5 = service.verifyCaptcha(captcha.captchaId, 'BAD5');
      expect(res5.success).toBe(false);
      expect(res5.error).toBe('Too many incorrect attempts. Please generate a new CAPTCHA.');

      // Subsequent attempt -> Challenge gone
      const res6 = service.verifyCaptcha(captcha.captchaId, '8M2QW');
      expect(res6.success).toBe(false);
      expect(res6.error).toBe('CAPTCHA expired. Please refresh and try again.');
    });

    it('9. should bypass when CAPTCHA_ENABLED=false in dev/demo mode', () => {
      process.env.NODE_ENV = 'development';
      process.env.CAPTCHA_ENABLED = 'false';
      process.env.DEMO_MODE = 'true';

      const result = service.verifyCaptcha('', '');
      expect(result.success).toBe(true);
    });
  });

  describe('cleanupExpiredChallenges', () => {
    it('10. should remove expired challenges from memory', () => {
      const captcha = service.generateCaptcha();
      const challenge = (service as any).challenges.get(captcha.captchaId);
      // Simulate expiration
      challenge.expiresAt = Date.now() - 1000;

      const removed = service.cleanupExpiredChallenges();
      expect(removed).toBeGreaterThanOrEqual(1);
      expect((service as any).challenges.has(captcha.captchaId)).toBe(false);
    });
  });
});
