import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Lead } from './schemas/lead.schema';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { LeadStatus } from '../common/types/enums';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(@InjectModel(Lead.name) private leadModel: Model<Lead>) {}

  /**
   * Honeypot field ("website") is only ever filled by bots, since it is
   * hidden from real users via CSS on the form. Silently accept without
   * persisting so bots don't learn their submission was rejected.
   */
  async create(
    dto: CreateLeadDto,
  ): Promise<{ id: string } | { accepted: true }> {
    const { website, ...rest } = dto;
    if (website && website.trim().length > 0) {
      this.logger.warn('Honeypot triggered on lead submission — discarding');
      return { accepted: true };
    }
    const created = new this.leadModel(rest);
    const saved = await created.save();
    return { id: saved.id };
  }

  async findAll(query: QueryLeadsDto) {
    const { page = 1, limit = 20, status, search } = query;
    const filter: QueryFilter<Lead> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [items, total, statusCounts] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.leadModel.countDocuments(filter).exec(),
      this.leadModel.aggregate<{ _id: LeadStatus; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      statusCounts,
    };
  }

  async findById(id: string) {
    const lead = await this.leadModel.findById(id).exec();
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async updateStatus(id: string, dto: UpdateLeadDto) {
    const lead = await this.findById(id);
    if (dto.status) lead.status = dto.status;
    return lead.save();
  }

  async addNote(id: string, text: string) {
    const lead = await this.findById(id);
    lead.notes.push({ text, createdAt: new Date() });
    return lead.save();
  }

  async remove(id: string) {
    const lead = await this.leadModel.findByIdAndDelete(id).exec();
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }
}
