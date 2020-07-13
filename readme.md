Service Auth:
This service is responsible for the onboarding  of Firm as well as 
Employee.

* All the api are documented on Swagger.
* All the authentication is done here and jwt verification is done with redis on other services
* To run the project we need ENV file,RSA-256 private public key for jwt signing and verfication.
- Mongodb
- Kafka (Depends on Zookeeper)
- Redis


ENV FILE FORMAT

- NODE_ENV
- NODE_PORT
- NEW_RELIC
- BASE_PATH
- MONGO_HOST
- DB_NAME
- MONGO_PORT
- MONGO_USER
- MONGO_PASSWORD
- ENC_KEY (Encryption Key)
- REDIS_PASSWORD
- REDIS_PORT
- REDIS_HOST
- REDIS_FAMILY
- REDIS_DB
- KAFKA_HOST