import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  SQSMessageAttributes,
} from 'aws-lambda'
import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandInput,
} from '@aws-sdk/client-sqs'
import { generateAPIGatewayResponse } from '../utils/generateAPIGatewayResponse'

const postOrder = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Request: ', JSON.stringify(event.body, undefined, 2))
  const client = new SQSClient()
  const input: SendMessageCommandInput = {
    MessageBody: JSON.stringify(event.body),
    QueueUrl: process.env.QUEUE_URL,
  }
  const command = new SendMessageCommand(input)
  const response = await client.send(command)

  if (response) {
    return generateAPIGatewayResponse(
      201,
      JSON.stringify({
        message: 'Event sent to queue',
        id: response.MessageId,
      }),
      {
        'Content-Type': 'application/json',
      }
    )
  } else {
    return generateAPIGatewayResponse(
      500,
      JSON.stringify({ message: 'The event was not sent' }),
      {
        'Content-Type': 'application/json',
      }
    )
  }
}

export const handler = postOrder
