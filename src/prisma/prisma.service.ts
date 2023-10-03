import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: 'mongodb+srv://bernhardsilva:FizcpjrbyoBua5s1@cluster0.y1qcxpo.mongodb.net/bookmark-nest',
        },
      },
    });
  }
}
