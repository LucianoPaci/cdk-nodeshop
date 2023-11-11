import {
  Stack,
  StackProps,
  Duration,
  CfnOutput,
  aws_iam,
  aws_lambda_event_sources,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import path = require('path')
import { Queue, DeadLetterQueue } from 'aws-cdk-lib/aws-sqs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { DatabaseConstruct } from './constructs/Database'

export class CdkNodeshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // Create API GATEWAY
    const APIGW = new apigw.RestApi(this, 'orders-endpoints', {
      description: 'API Gateway',
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['http://localhost:3000'],
      },
    })

    new CfnOutput(this, 'apiUrl', { value: APIGW.url })

    // const deadLetterQueue = new Queue(this, 'orders-dlq', {
    //   visibilityTimeout: Duration.seconds(300),
    //   queueName: 'orders-dlq'
    // })

    const dbStack = new DatabaseConstruct(this, 'database-stack', {})

    const queue = new Queue(this, 'orders-queue', {
      visibilityTimeout: Duration.seconds(300),
      queueName: 'orders-queue',
    })

    // example resource
    const postOrderHandler = new NodejsFunction(this, 'post-orders-handler', {
      timeout: Duration.seconds(30),
      entry: path.join(__dirname, 'handlers', 'postOrder.ts'),
      environment: {
        QUEUE_URL: queue.queueUrl,
      },
    })

    postOrderHandler.addToRolePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: [queue.queueArn],
        actions: ['*'],
      })
    )

    const getOrderHandler = new NodejsFunction(this, 'get-orders-handler', {
      timeout: Duration.seconds(30),
      entry: path.join(__dirname, 'handlers', 'getOrder.ts'),
    })

    const orders = APIGW.root.addResource('orders')

    orders.addMethod(
      'POST',
      new apigw.LambdaIntegration(postOrderHandler, { proxy: true })
    )

    orders.addMethod(
      'GET',
      new apigw.LambdaIntegration(getOrderHandler, { proxy: true })
    )

    // SQS Consumer Handler - Function
    const orderConsumerHandler = new NodejsFunction(this, 'order-consumer', {
      timeout: Duration.seconds(30),
      entry: path.join(__dirname, 'handlers', 'orderConsumer.ts'),
      environment: {
        DDB_TABLE: dbStack.ordersTable.tableName,
      },
    })

    // Allow Consumer to get data from queue
    orderConsumerHandler.addToRolePolicy(
      new aws_iam.PolicyStatement({
        effect: aws_iam.Effect.ALLOW,
        resources: [queue.queueArn],
        actions: ['*'],
      })
    )
    // // SQS Consumer Handler - Role
    // const orderConsumerHandlerRole = new Role(
    //   this,
    //   'orderConsumerHandlerRole',
    //   {
    //     assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    //     roleName: 'OrderConsumerHandlerRole',
    //   }
    // )
    // Give permissions to Handler to write to DB
    dbStack.ordersTable.grantReadWriteData(orderConsumerHandler)

    // Add SQS as event source to lambda trigger
    const eventSource = new SqsEventSource(queue, {
      batchSize: 5,
      maxBatchingWindow: Duration.seconds(10),
    })
    orderConsumerHandler.addEventSource(eventSource)

    // Primero hagamos que la lambda haga un echo
    // Despues que envie a SQS

    // const queue = new sqs.Queue(this, 'CdkNodeshopQueue', {
    //   visibilityTimeout: Duration.seconds(300),
    // })
  }
}
