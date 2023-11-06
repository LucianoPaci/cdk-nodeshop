import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
const getOrder = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Request: ', JSON.stringify(event.body, undefined, 2))

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'Hello' }),
  }
}

export const handler = getOrder
