import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { SQSEvent } from 'aws-lambda'

const writeToDb = async (event: SQSEvent) => {
  // db connection
  // get event and parse it
  // put in db
  // return response
}
