import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { Lead } from './schemas/lead.schema';

describe('LeadsService', () => {
  let service: LeadsService;
  let saveMock: jest.Mock;
  let modelConstructor: jest.Mock;

  beforeEach(async () => {
    saveMock = jest.fn().mockResolvedValue({ id: 'lead-id-1' });
    modelConstructor = jest
      .fn()
      .mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        save: saveMock,
      }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: getModelToken(Lead.name), useValue: modelConstructor },
      ],
    }).compile();

    service = module.get(LeadsService);
  });

  it('persists a valid lead submission', async () => {
    const result = await service.create({
      name: 'Test Customer',
      phone: '+91 98765 43210',
      message: 'Interested in a rooftop system',
    });

    expect(modelConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Customer',
        phone: '+91 98765 43210',
      }),
    );
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ id: 'lead-id-1' });
  });

  it('silently discards submissions where the honeypot field is filled, without saving', async () => {
    const result = await service.create({
      name: 'Bot',
      phone: '0000000000',
      website: 'http://spam.example',
    });

    expect(modelConstructor).not.toHaveBeenCalled();
    expect(saveMock).not.toHaveBeenCalled();
    expect(result).toEqual({ accepted: true });
  });

  it('never persists the honeypot field even when empty', async () => {
    await service.create({
      name: 'Test Customer',
      phone: '9876543210',
      website: '',
    });

    const [savedData] = modelConstructor.mock.calls[0] as [
      Record<string, unknown>,
    ];
    expect(savedData).not.toHaveProperty('website');
  });
});
