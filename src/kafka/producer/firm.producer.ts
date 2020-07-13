import { SignupProducer, ForgotPasswordProducer, EmployeeSignupProducer } from "../../interfaces";
import { kafkaProducer } from "./base.producer";
import { KAFKA_PRODUCERS } from "../../enums";
import { appLogger } from "../../utils";


export class FirmProducer {
    constructor() {

    }


    sendEmail(emailPayload: SignupProducer) {
        try {
            kafkaProducer.sendMessage({
                messages: JSON.stringify(emailPayload),
                topic: KAFKA_PRODUCERS.FIRM_SIGNUP,
                partition: 0,
            })
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

    sendForgotEmail(emailPayload: ForgotPasswordProducer) {
        try {

            kafkaProducer.sendMessage({
                messages: JSON.stringify(emailPayload),
                topic: KAFKA_PRODUCERS.FORGOT_PASSWORD,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

    signupEmployee(employee: EmployeeSignupProducer) {
        try {
            console.log('new signuppppppppppppppppppppppppppp')

            kafkaProducer.sendMessage({
                messages: JSON.stringify(employee),
                topic: KAFKA_PRODUCERS.SIGNUP_EMPLOYEE,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }


}


export const firmProducer = new FirmProducer();