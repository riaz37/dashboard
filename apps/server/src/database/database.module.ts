import { Module, Global } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { KafkaModule } from './kafka/kafka.module';

@Global()
@Module({
  imports: [RedisModule, KafkaModule],
  exports: [RedisModule, KafkaModule],
})
export class DatabaseModule {}
