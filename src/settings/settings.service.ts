import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';

function flatten(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, unknown> {
  return Object.entries(obj).reduce<Record<string, unknown>>(
    (acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.getPrototypeOf(value) === Object.prototype
      ) {
        Object.assign(acc, flatten(value as Record<string, unknown>, path));
      } else if (value !== undefined) {
        acc[path] = value;
      }
      return acc;
    },
    {},
  );
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  async get() {
    const existing = await this.settingsModel.findOne().exec();
    if (existing) return existing;
    const created = new this.settingsModel({});
    return created.save();
  }

  async update(dto: UpdateSettingsDto) {
    await this.get(); // ensures a document exists
    const $set = flatten(dto as unknown as Record<string, unknown>);
    return this.settingsModel
      .findOneAndUpdate({}, { $set }, { returnDocument: 'after', upsert: true })
      .exec();
  }
}
