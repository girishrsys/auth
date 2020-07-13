import { EmployeeSignupProducer, EmployeeBlockProducer, EmployeeUnblockProducer, EmployeeDeletedProducer, EmployeeNameChangedProducer } from "../../interfaces";
import { kafkaProducer } from "./base.producer";
import { KAFKA_PRODUCERS } from "../../enums";
import { appLogger } from "../../utils";


export class EmployeeProducer {

    constructor() {

    }

    signupEmployee(employee: EmployeeSignupProducer) {
        try {
            kafkaProducer.sendMessage({
                messages: JSON.stringify(employee),
                topic: KAFKA_PRODUCERS.SIGNUP_EMPLOYEE,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

    blockEmployee(employee: EmployeeBlockProducer) {
        try {
            kafkaProducer.sendMessage({
                messages: JSON.stringify(employee),
                topic: KAFKA_PRODUCERS.EMPLOYEE_BLOCKED,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

    unblockEmployee(employee: EmployeeUnblockProducer) {
        try {
            kafkaProducer.sendMessage({
                messages: JSON.stringify(employee),
                topic: KAFKA_PRODUCERS.EMPLOYEE_UNBLOCKED,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

    employeeDeleted(employee: EmployeeDeletedProducer) {
        try {
            kafkaProducer.sendMessage({
                messages: JSON.stringify(employee),
                topic: KAFKA_PRODUCERS.EMPLOYEE_DELETED,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

    employeeNameChanged(employee: EmployeeNameChangedProducer) {
        try {
            console.log('producer message sending success.........................')
            kafkaProducer.sendMessage({
                messages: JSON.stringify(employee),
                topic: KAFKA_PRODUCERS.EMPLOYEE_NAME_CHANGED,
                partition: 0
            });
        } catch (err) {
            appLogger.error(err.messages);
        }
    }

}


export const employeeProducer = new EmployeeProducer();