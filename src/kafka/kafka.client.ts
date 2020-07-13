

import * as kafka from 'kafka-node';
import { KAFKA_HOST, appLogger } from '../utils';

class KafkaClientClass {

    kafkaClient: kafka.KafkaClient;

    constructor() {
        this.kafkaClient = new kafka.KafkaClient({
            kafkaHost: KAFKA_HOST
          //  kafkaHost:'kafka:9093'
        })
        this.kafkaClient.on('error', (err) => {
           // console.log('....................host',KAFKA_HOST)
          console.log('............................................error in microservice auth clinetkafka',err)
            appLogger.error(err);
        });
    }

    getKafkaInstance() {
        console.log(',,,,,,,,,,,,,,,,',this.kafkaClient)
        return this.kafkaClient;
    }

}

export const kafkaClient = new KafkaClientClass();