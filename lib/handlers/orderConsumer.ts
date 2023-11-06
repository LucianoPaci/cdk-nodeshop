import { SQSEvent } from 'aws-lambda'
import * as AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

const db = new AWS.DynamoDB.DocumentClient()

const TABLE_NAME = process.env.DDB_TABLE || ''

export const handler = async (event: SQSEvent): Promise<any> => {
  try {
    if (!event.Records || event.Records.length === 0) {
      throw new Error('No records in the event')
    }

    for (const record of event.Records) {
      console.log('🚀 ~ file: orderConsumer.ts:16 ~ handler ~ record:', record)
      const message = JSON.parse(JSON.parse(record.body))

      // if (typeof message !== 'object') {
      //   throw new Error('Invalid message format')
      // }

      const item = {
        ...message,
        orderId: uuidv4(),
      }

      const putParams: AWS.DynamoDB.DocumentClient.PutItemInput = {
        TableName: TABLE_NAME,
        Item: item,
      }

      await db.put(putParams).promise()
      console.log(`Saved item to DynamoDB: ${item.itemId}`)
    }
  } catch (error) {
    console.error('Error processing SQS message:', error)
    throw error
  }
}
