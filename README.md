<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
</p>

---

## 📖 Description

This project demonstrates a **Serverless application** built with **NestJS**, running on **AWS Lambda**, and using **MySQL** and **OpenSearch**.  
It includes functionality for parsing large JSON files, validating data, and persisting it into the database and OpenSearch with transaction safety and retry logic.

---

## ⚡ Technologies

- [NestJS](https://nestjs.com/) — Node.js framework for scalable applications
- [Serverless Framework](https://www.serverless.com/) — to deploy Lambda functions
- [AWS Lambda](https://aws.amazon.com/lambda/) — serverless compute platform
- [MySQL](https://www.mysql.com/) — relational database
- [OpenSearch](https://opensearch.org/) — search and analytics engine
- [Docker](https://www.docker.com/) — containerized local development
- [docker-compose](https://docs.docker.com/compose/) — local services orchestration

---

## 🛠 Local Setup

### 1. Clone the repository

```bash
$ git clone https://github.com/Volodya-Kmet/aws-lambda.git
$ cd aws-lambda
```

### 2. Install dependencies

```bash
$ npm install
```

### 3. Start services with Docker
Check 'Useful Resources' block
```bash
$ docker-compose up -d
```

This will start **MySQL** and **OpenSearch** locally.  
The `docker-compose.yml` file is included in the repository.

### 4. Run the application


development

```bash
$ npm run start
```


### 5. Run tests

unit tests

```bash
$ npm run test
```


coverage

```bash
$ npm run test:cov
```

---

## 🚀 Deployment

1. Manually configure AWS infrastructure:
    - Create **VPC**, **Subnets**, **Security Groups**
    - Create **RDS MySQL instance**
    - Create **OpenSearch cluster**
    - Configure **IAM roles** for Lambda

2. Update the `serverless.yml` file with your resources:
    - Attach **security groups**
    - Add **environment variables** for DB and OpenSearch
    - Assign the proper **IAM role** for Lambda execution

3. Deploy with Serverless Framework:


```bash
$ npm run deploy:<stage>
```


---

## 📚 Useful Resources

- [Docker Installation Guide](https://docs.docker.com/get-docker/)
- [docker-compose Installation Guide](https://docs.docker.com/compose/install/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Serverless Framework Docs](https://www.serverless.com/framework/docs/)
