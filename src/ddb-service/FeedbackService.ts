import { DynamoDBHelper } from ".";
import { config } from "../config/config";
import { Feedback } from "../models/feedback.model";
import { createLogger } from "../utils/Logger";
import { PutCommandInput, GetCommandInput } from "@aws-sdk/lib-dynamodb";

const logger = createLogger("FeedbackService");

export class FeedbackServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "FeedbackServiceError";
  }
}

export class FeedbackService {
  private static readonly className = "FeedbackService";
  private static readonly feedbackTableName = config.FEEDBACK_TABLE_NAME;

  static async createFeedback(feedback: Feedback): Promise<Feedback> {
    logger.debug(
      `${this.className}.createFeedback: Creating feedback with ID ${feedback.id}`
    );

    const params: PutCommandInput = {
      TableName: this.feedbackTableName,
      Item: feedback,
    };

    try {
      await DynamoDBHelper.putItem(params);
      logger.info(
        `${this.className}.createFeedback: Successfully created feedback ${feedback.id}`,
        feedback
      );
      return feedback;
    } catch (error: any) {
      logger.error(`${this.className}.createFeedback error:`, error);
      throw new FeedbackServiceError(
        "Failed to create feedback",
        "CREATE_FEEDBACK_FAILED"
      );
    }
  }
}

export default FeedbackService;
