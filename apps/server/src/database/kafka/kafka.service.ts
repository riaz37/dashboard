import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const broker = this.configService.get<string>(
      'KAFKA_BROKER',
      'localhost:9092',
    );

    this.kafka = new Kafka({
      clientId: 'analytics-backend',
      brokers: [broker],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'analytics-group' });

    await this.producer.connect();
    await this.consumer.connect();

    console.log('✅ Connected to Kafka');
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
    if (this.consumer) {
      await this.consumer.disconnect();
    }
    console.log('🔌 Disconnected from Kafka');
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.id || Date.now().toString(),
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
    } catch (error) {
      console.error('Error sending Kafka message:', error);
      throw error;
    }
  }

  async subscribeToTopic(
    topic: string,
    callback: (payload: EachMessagePayload) => Promise<void>,
  ): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload) => {
        try {
          await callback(payload);
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      },
    });
  }

  async createTopic(topic: string): Promise<void> {
    const admin = this.kafka.admin();
    await admin.connect();

    try {
      await admin.createTopics({
        topics: [
          {
            topic,
            numPartitions: 3,
            replicationFactor: 1,
          },
        ],
      });
      console.log(`✅ Created topic: ${topic}`);
    } catch (error) {
      if (error.type === 'TOPIC_ALREADY_EXISTS') {
        console.log(`Topic ${topic} already exists`);
      } else {
        console.error('Error creating topic:', error);
        throw error;
      }
    } finally {
      await admin.disconnect();
    }
  }

  getProducer(): Producer {
    return this.producer;
  }

  getConsumer(): Consumer {
    return this.consumer;
  }
}
