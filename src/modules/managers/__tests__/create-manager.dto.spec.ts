import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateManagerDto } from '../dto/create-manager.dto';


describe('CreateManagerDto', () => {
  let dto: CreateManagerDto;

  beforeEach(() => {
    dto = {
      name: 'Олександр',
      surname: 'Петренко',
      email: 'alex@example.com',
      phone: '+380971234567',
    };
  });

  it('should pass validation with valid data', async () => {
    const dtoObj = plainToInstance(CreateManagerDto, dto);
    const errors = await validate(dtoObj);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with minimal required fields', async () => {
    const minimalDto = {
      name: 'Олександр',
      email: 'alex@example.com',
    };
    const dtoObj = plainToInstance(CreateManagerDto, minimalDto);
    const errors = await validate(dtoObj);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when name is empty', async () => {
    dto.name = '';
    const dtoObj = plainToInstance(CreateManagerDto, dto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when name is not a string', async () => {
    const invalidDto = {
      ...dto,
      name: 123, // Invalid type
    };
    const dtoObj = plainToInstance(CreateManagerDto, invalidDto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation when email is missing', async () => {
    const invalidDto = {
      name: 'Олександр',
      surname: 'Петренко',
      phone: '+380971234567',
    };
    const dtoObj = plainToInstance(CreateManagerDto, invalidDto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation when email is invalid', async () => {
    dto.email = 'not-an-email';
    const dtoObj = plainToInstance(CreateManagerDto, dto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    // Note: We're testing for isStrictEmail but the implementation details
    // depend on how IsStrictEmail is implemented in your application
    expect(errors[0].constraints).toBeDefined();
  });

  it('should pass validation when surname is omitted', async () => {
    const { surname, ...dtoWithoutSurname } = dto;
    const dtoObj = plainToInstance(CreateManagerDto, dtoWithoutSurname);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBe(0);
  });

  it('should fail validation when surname is not a string', async () => {
    const invalidDto = {
      ...dto,
      surname: 123, // Invalid type
    };
    const dtoObj = plainToInstance(CreateManagerDto, invalidDto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('surname');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should pass validation when phone is omitted', async () => {
    const { phone, ...dtoWithoutPhone } = dto;
    const dtoObj = plainToInstance(CreateManagerDto, dtoWithoutPhone);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBe(0);
  });

  it('should fail validation when phone has invalid format', async () => {
    dto.phone = 'invalid-phone';
    const dtoObj = plainToInstance(CreateManagerDto, dto);
    const errors = await validate(dtoObj);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('phone');
    expect(errors[0].constraints).toHaveProperty('matches');
  });

  it('should pass validation with valid phone number formats', async () => {
    // Test different valid phone formats
    const validPhoneFormats = [
      '+380971234567',
      '+380501234567',
      '+380631234567',
      '+12125551234', // US format
    ];

    for (const phone of validPhoneFormats) {
      dto.phone = phone;
      const dtoObj = plainToInstance(CreateManagerDto, dto);
      const errors = await validate(dtoObj);
      expect(errors.length).toBe(0);
    }
  });
});