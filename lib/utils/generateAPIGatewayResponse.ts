import { Cors } from 'aws-cdk-lib/aws-apigateway'
import { APIGatewayProxyResult } from 'aws-lambda'

export function generateAPIGatewayResponse(
  statusCode: number,
  body: any,
  headers: Record<string, string> = {},
  isBase64Encoded = false
): APIGatewayProxyResult {
  return {
    statusCode,
    body,
    headers: {
      ...headers,
      'Access-Control-Allow-Headers': [...Cors.DEFAULT_HEADERS, 'apikey'].join(
        ','
      ),
      // 'Access-Control-Allow-Origin': process.env.ORIGIN_URL,
      'Access-Control-Allow-Credentials': false,
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
    },
    isBase64Encoded,
  }
}
