import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';
import { toSlug } from '../common/utils/slugify.util';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async findAll(query: QueryProjectsDto) {
    const { page = 1, limit = 12, projectType, featured } = query;
    const filter: QueryFilter<Project> = { isActive: true };
    if (projectType) filter.projectType = projectType;
    if (featured !== undefined) filter.featured = featured;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findAllForAdmin(query: QueryProjectsDto) {
    const { page = 1, limit = 20, projectType } = query;
    const filter: QueryFilter<Project> = {};
    if (projectType) filter.projectType = projectType;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findBySlug(slug: string) {
    const project = await this.projectModel
      .findOne({ slug, isActive: true })
      .exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async findById(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async create(dto: CreateProjectDto) {
    const slug = await this.uniqueSlug(toSlug(dto.name));
    const created = new this.projectModel({ ...dto, slug });
    return created.save();
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.findById(id);
    if (dto.name && dto.name !== project.name) {
      project.set('slug', await this.uniqueSlug(toSlug(dto.name), id));
    }
    Object.assign(project, dto);
    return project.save();
  }

  async remove(id: string) {
    const project = await this.projectModel.findByIdAndDelete(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    let slug = base;
    let suffix = 1;
    while (
      await this.projectModel.exists({
        slug,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      })
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    return slug;
  }
}
