import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

interface DatabaseStackProps extends StackProps {}

export class DatabaseStack extends Stack {
  public readonly ordersTable: dynamodb.Table
  constructor(scope: Construct, id: string, props?: DatabaseStackProps) {
    super(scope, id, props)

    /// Deberia crear la DB y los consumers de la queue

    const table = new dynamodb.Table(this, 'orders-table', {
      partitionKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      tableName: 'orders-table',
    })

    this.ordersTable = table

    new CfnOutput(this, 'orders-table-name', {
      value: table.tableName,
    })
  }
}
