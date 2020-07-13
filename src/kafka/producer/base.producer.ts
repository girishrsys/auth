import * as kafka from 'kafka-node';
import { kafkaClient } from '../kafka.client';
import { KAFKA_PRODUCERS } from '../../enums';
import { appLogger } from '../../utils';

class BaseKafkaProducer {

    producer: kafka.Producer;

    constructor() {
        this.producer = new kafka.Producer(kafkaClient.getKafkaInstance(), {
            partitionerType: 2,
            requireAcks: 1,
        });

        this.producer.on('ready', () => {
            this.producer.createTopics([
                KAFKA_PRODUCERS.FIRM_SIGNUP,
                KAFKA_PRODUCERS.FORGOT_PASSWORD,
                KAFKA_PRODUCERS.EMPLOYEE_BLOCKED,
                KAFKA_PRODUCERS.EMPLOYEE_UNBLOCKED,
                KAFKA_PRODUCERS.SIGNUP_EMPLOYEE,
                KAFKA_PRODUCERS.CASE_DETAIL_UPDATED,
                KAFKA_PRODUCERS.CLIENT_PROFILE_UPDATED,
                KAFKA_PRODUCERS.EMPLOYEE_DELETED,
                KAFKA_PRODUCERS.EMPLOYEE_NAME_CHANGED
            ], (err, data) => {
                if (err) {
                    console.log('........................err in producer auth',err)
                    appLogger.error(err.messages);
                } else {
                    appLogger.info('kafka topics created successfully');
                }
            });
        });
    }

    sendMessage(req: kafka.ProduceRequest) {    
        
        console.log(req);
        this.producer.send([
            {
                partition: req.partition,
                topic: req.topic,
                messages: req.messages,
            }
        ], (err, data) => {
            if (err) {
                appLogger.error(err);
            }
            console.log('pppppppppppppppppppppppp',data)
        })
    }

}


export const kafkaProducer = new BaseKafkaProducer();