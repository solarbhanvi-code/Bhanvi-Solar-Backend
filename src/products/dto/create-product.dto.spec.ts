import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateProductDto, payload);
  return validate(dto);
}

describe('CreateProductDto validation', () => {
  const validPayload = {
    name: '550W Mono Solar Panel',
    description: 'A high-efficiency monocrystalline panel.',
    category: '507f1f77bcf86cd799439011',
  };

  it('passes with only the required fields', async () => {
    const errors = await validateDto(validPayload);
    expect(errors).toHaveLength(0);
  });

  it('fails when name is missing', async () => {
    const { name, ...rest } = validPayload;
    void name;
    const errors = await validateDto(rest);
    expect(errors.some((e) => e.property === 'name')).toBe(true);
  });

  it('fails when category is not a valid Mongo id', async () => {
    const errors = await validateDto({
      ...validPayload,
      category: 'not-an-id',
    });
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });

  it('fails when price is negative', async () => {
    const errors = await validateDto({ ...validPayload, price: -100 });
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });

  it('fails when availability is not a recognized enum value', async () => {
    const errors = await validateDto({
      ...validPayload,
      availability: 'SOLD_OUT',
    });
    expect(errors.some((e) => e.property === 'availability')).toBe(true);
  });

  it('fails when specifications entries are malformed', async () => {
    const errors = await validateDto({
      ...validPayload,
      specifications: [{ key: 'Power' }],
    });
    expect(errors.some((e) => e.property === 'specifications')).toBe(true);
  });
});
