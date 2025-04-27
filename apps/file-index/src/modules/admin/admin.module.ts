import { Module, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Application } from 'express';
import { initAdminRouter } from 'src/modules/admin/utils/admin-router';
import { PrismaService } from 'src/modules/shared/services/prisma.service';
import { AdminPrefix } from 'src/modules/shared/types/prefixes';

@Module({})
export class AdminModule implements OnModuleInit {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit() {
    const app = this.httpAdapterHost.httpAdapter.getInstance<Application>();
    const adminRouter = await initAdminRouter(
      this.prismaService,
      'Movie',
      'Show',
      'ShowSeason',
      'ShowEpisode',
      'MediaMetadata',
      'MediaUrl',
      'HtmlFetch',
    );
    app.use(AdminPrefix, adminRouter);
  }
}
