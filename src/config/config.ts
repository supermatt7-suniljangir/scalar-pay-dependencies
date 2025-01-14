import dotenv from "dotenv";
import { LogLevel } from "../types/log-level";

dotenv.config();

export enum STAGE {
  PROD = "prod",
  DEV = "dev",
}

export interface PaymentConfig {
  default_platform_fee_per_month: number;
}

export interface Config {
  USER_TABLE_NAME: string;
  USER_TABLE_INDEX_NAME_FOR_EMAIL: string;
  GROUP_TABLE_NAME: string;
  GROUP_INVITE_TABLE_NAME: string;
  FEEDBACK_TABLE_NAME: string;
  SERVER_PORT: number;
  STAGE: STAGE;
  LOG_LEVEL: LogLevel;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  AWS_SECRET: {
    JWT_SECRET_NAME: string;
    GOOGLE_CLIENT_ID_NAME: string;
  };
  JTW_TOKEN_EXPIRY: number;
  MONGODB_URI: string;
  MAX_GROUPS_PER_USER: number;
  STRIPE_WEBHOOK_SECRET: string;
  GROUP_INVITE_EXPIRY_MILLI: number;
}

const getStage = (): STAGE => {
  return (process.env.STAGE as STAGE) || STAGE.DEV;
};

export const config: Config = {
  USER_TABLE_NAME: `${getStage()}-User`,
  USER_TABLE_INDEX_NAME_FOR_EMAIL: `${getStage()}-UserEmailIndex`,
  GROUP_TABLE_NAME: `${getStage()}-Group`,
  GROUP_INVITE_TABLE_NAME: `${getStage()}-GroupInvite`,
  FEEDBACK_TABLE_NAME: `${getStage()}-feedback`,
  SERVER_PORT: parseInt(process.env.SERVER_PORT || "3000", 10),
  STAGE: getStage(),
  LOG_LEVEL: getStage() === STAGE.PROD ? LogLevel.INFO : LogLevel.DEBUG,
  STRIPE_SECRET_KEY:
    process.env.STRIPE_SECRET_KEY ||
    "sk_test_51QfglJEAQxoPGuuNjmIUu5G2dB5gaKyO8TWDEb6QfHuyHZrxtQJiMlPe8c5XN7HzyNeoXIwCkp2tbrCyMont4pyH00QkkBCbc3",
  STRIPE_PUBLISHABLE_KEY:
    process.env.STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51QfglJEAQxoPGuuNXNw67FdTvHs8Jo4paWbOTMpugGvQN4xdnU3VJuY0iVojgINk2RyeQnzF4dRrY9TwdwIKwy0500UHZx6Cn3",
  AWS_SECRET: {
    JWT_SECRET_NAME: `${getStage()}-jwt-secret`,
    GOOGLE_CLIENT_ID_NAME: `${getStage()}-google-client-id`,
  },
  JTW_TOKEN_EXPIRY: 30 * 24 * 60 * 60, // 30 days in seconds
  MONGODB_URI: "mongodb://localhost:27017/scalary-payment-mongodb",
  MAX_GROUPS_PER_USER: 20,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "test",
  GROUP_INVITE_EXPIRY_MILLI: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};
