import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateLeadDto } from './create-lead.dto';

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateLeadDto, payload);
  return validate(dto);
}

describe('CreateLeadDto validation', () => {
  it('passes with just a valid name and phone', async () => {
    const errors = await validateDto({
      name: 'Jane Doe',
      phone: '+91 98765 43210',
    });
    expect(errors).toHaveLength(0);
  });

  it('fails when name is missing', async () => {
    const errors = await validateDto({ phone: '+91 98765 43210' });
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when phone is missing', async () => {
    const errors = await validateDto({ name: 'Jane Doe' });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('fails when phone contains letters', async () => {
    const errors = await validateDto({
      name: 'Jane Doe',
      phone: 'not-a-phone',
    });
    expect(errors.some((e) => e.property === 'phone')).toBe(true);
  });

  it('fails on an invalid email when one is supplied', async () => {
    const errors = await validateDto({
      name: 'Jane Doe',
      phone: '9876543210',
      email: 'not-an-email',
    });
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails when message exceeds the maximum length', async () => {
    const errors = await validateDto({
      name: 'Jane Doe',
      phone: '9876543210',
      message: 'a'.repeat(2001),
    });
    expect(errors.some((e) => e.property === 'message')).toBe(true);
  });

  it('fails on an unrecognized property type value', async () => {
    const errors = await validateDto({
      name: 'Jane Doe',
      phone: '9876543210',
      propertyType: 'CASTLE',
    });
    expect(errors.some((e) => e.property === 'propertyType')).toBe(true);
  });
});
