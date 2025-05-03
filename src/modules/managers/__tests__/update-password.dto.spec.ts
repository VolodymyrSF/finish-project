import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePasswordDto } from '../dto/update-password.dto';

describe('UpdatePasswordDto', () => {
  let dto: UpdatePasswordDto;

  beforeEach(() => {
    dto = {
      email: 'alex@example.com',
      password: 'SecurePass123!',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtYW5hZ2VySWQiOiI2Zjg1YWNlZC1lZDQ4LTQxODQtYWM3Ny1iNzcxMWZjZjI5Y2YiLCJ0eXBlIjoiYWN0aXZhdGUiLCJpYXQiOjE3NDA1NjE5MTcsImV4cCI6MTc0MDU2MzcxN30.Ddx2pqncotjLl7WVKrBZRLGpvAVDR0pkGI2MjtNdTLg',
    };
  });

  it('should pass validation with valid data', async () => {
    const dtoObj = plainToInstance(UpdatePasswordDto, dto);
    const errors = await validate(dtoObj);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when email is missing', async () => {
    const { email, ...dtoWithoutEmail } = dto;
    const dtoObj = plainToInstance(UpdatePasswordDto, dtoWithoutEmail);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when email is invalid', async () => {
    dto.email = 'not-an-email';
    const dtoObj = plainToInstance(UpdatePasswordDto, dto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation when password is missing', async () => {
    const { password, ...dtoWithoutPassword } = dto;
    const dtoObj = plainToInstance(UpdatePasswordDto, dtoWithoutPassword);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when password is less than 8 characters', async () => {
    dto.password = 'short';
    const dtoObj = plainToInstance(UpdatePasswordDto, dto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation when password is not a string', async () => {
    const invalidDto = {
      ...dto,
      password: 12345678, // Invalid type
    };
    const dtoObj = plainToInstance(UpdatePasswordDto, invalidDto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when token is missing', async () => {
    const { token, ...dtoWithoutToken } = dto;
    const dtoObj = plainToInstance(UpdatePasswordDto, dtoWithoutToken);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when token is not a string', async () => {
    const invalidDto = {
      ...dto,
      token: 12345, // Invalid type
    };
    const dtoObj = plainToInstance(UpdatePasswordDto, invalidDto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass validation with different valid emails', async () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.com',
      'user+tag@example.com',
      'admin@subdomain.domain.co.uk',
    ];

    for (const email of validEmails) {
      dto.email = email;
      const dtoObj = plainToInstance(UpdatePasswordDto, dto);
      const errors = await validate(dtoObj);
      expect(errors.length).toBe(0);
    }
  });

  it('should pass validation with different valid passwords', async () => {
    const validPasswords = [
      'SecurePassword123!',
      'AnotherStrongPassword123',
      'VeryLongAndSecurePasswordWithSymbols123!@#',
      'Pass!word-123',
    ];

    for (const password of validPasswords) {
      dto.password = password;
      const dtoObj = plainToInstance(UpdatePasswordDto, dto);
      const errors = await validate(dtoObj);
      expect(errors.length).toBe(0);
    }
  });

  it('should validate combined fields correctly', async () => {
    const invalidDto = {
      email: 'not-an-email',
      password: 'short',
      token: '',
    };
    
    const dtoObj = plainToInstance(UpdatePasswordDto, invalidDto);
    const errors = await validate(dtoObj);
    
    // All three fields should fail validation
    expect(errors.length).toBe(3);
    
    // Check that specific properties failed
    const properties = errors.map(error => error.property);
    expect(properties).toContain('email');
    expect(properties).toContain('password');
    expect(properties).toContain('token');
  });
});