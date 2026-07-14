import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  constructor() {
    // 1. On crée un pool de connexion classique avec le package 'pg'
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // 2. On l'enveloppe dans l'adaptateur officiel Prisma 7
    const adapter = new PrismaPg(pool);

    // 3. On passe l'adaptateur au constructeur parent
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🐘 Connexion réussie à PostgreSQL (Prisma 7 Adapter) !');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}