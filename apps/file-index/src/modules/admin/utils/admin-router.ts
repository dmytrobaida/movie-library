import { PrismaService } from 'src/modules/shared/services/prisma.service';

export const initAdminRouter = async (
  prisma: PrismaService,
  ...tables: string[]
) => {
  const { AdminJS } = await import('adminjs');
  const { Database, Resource, getModelByName } = await import(
    '@adminjs/prisma'
  );
  const { default: AdminJSExpress } = await import('@adminjs/express');

  AdminJS.registerAdapter({
    Database,
    Resource,
  });

  const resources = tables.map((t) => ({
    resource: {
      model: getModelByName(t) as unknown,
      client: prisma,
    },
    options: {},
  }));

  const admin = new AdminJS({
    resources,
  });

  const adminRouter = AdminJSExpress.buildRouter(admin);
  return adminRouter;
};
