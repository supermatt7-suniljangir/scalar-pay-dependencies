// models/queue.model.ts
import { Document, Schema } from "mongoose";
import { mongooseInstance } from "../mongodb-service/index";

export enum TaskTypes {
  CREATE_STRIPE_CONNECT_ACCOUNT = "CREATE_STRIPE_CONNECT_ACCOUNT",
  PROCESS_PAYMENT = "PROCESS_PAYMENT",
}

export interface IQueueItem extends Document {
  message: string;
  timestamp: Date;
  processed: boolean;
  visibleAt: Date;
}

const QueueSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  processed: {
    type: Boolean,
    default: false,
  },
  visibleAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

QueueSchema.index({ timestamp: 1, processed: 1, visibleAt: 1 });

export default mongooseInstance.model<IQueueItem>("Queue", QueueSchema);
