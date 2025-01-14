import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { createLogger } from "./Logger";
import { config } from "../config/config";

const secretsManagerClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
/**
 * Cached variables to store secrets for reuse, minimizing repeated API calls.
 */
let JWT_SECRET_VALUE: string;
let GOOGLE_CLIENT_ID_VALUE: string | undefined;

/**
 * Interface representing the structure of secrets retrieved from AWS Secrets Manager.
 */
export interface Secrets {
  JWT_SECRET_VALUE: string; // Secret key used for JWT token signing and verification.
  GOOGLE_CLIENT_ID_VALUE?: string; // Client ID for Google authentication.
}

/**
 * Fetches secrets from AWS Secrets Manager.
 *
 * @returns {Promise<Secrets>} - A promise resolving to an object containing the required secrets.
 * @throws Will throw an error if the secrets cannot be retrieved or are improperly formatted.
 */
export const getSecrets = async (secretsToGet: string[]): Promise<Secrets> => {
  // Environment variables defining the names of secrets stored in AWS Secrets Manager.
  const jwtSecretName = config.AWS_SECRET.JWT_SECRET_NAME; // Secret name for JWT_SECRET.
  const googleClientIdName = config.AWS_SECRET.GOOGLE_CLIENT_ID_NAME; // Secret name for GOOGLE_CLIENT_ID.
  const logger = createLogger("getSecrets");

  // Debug logs for environment variables
  logger.debug("Executing getSecrets():", {
    jwtSecretName,
    googleClientIdName,
  });

  let secretsRequest = [];

  // Fetch secret only if not present already. Return cached secrets if already available.
  if (secretsToGet.includes(jwtSecretName) && !JWT_SECRET_VALUE) {
    logger.debug("Fetching JWT secret from Secrets Manager");
    secretsRequest.push(
      secretsManagerClient.send(
        new GetSecretValueCommand({ SecretId: jwtSecretName })
      )
    );
  }

  // Fetch secret only if not present already. Return cached secrets if already available.
  if (secretsToGet.includes(googleClientIdName) && !GOOGLE_CLIENT_ID_VALUE) {
    logger.debug("Fetching Google Client ID secret from Secrets Manager");
    secretsRequest.push(
      secretsManagerClient.send(
        new GetSecretValueCommand({ SecretId: googleClientIdName })
      )
    );
  }

  try {
    /**
     * Fetches all secrets in parallel using Promise.all for efficiency.
     */
    logger.debug("Sending requests to AWS Secrets Manager");
    const responses = await Promise.all(secretsRequest);

    /**
     * Parses and assigns retrieved secrets to cached variables.
     */
    responses.forEach(response => {
      logger.debug("Received secret response:", { response });

      if (response.Name === jwtSecretName && response.SecretString) {
        JWT_SECRET_VALUE = response.SecretString;
        logger.debug("Cached JWT_SECRET_VALUE:", JWT_SECRET_VALUE);
      }
      if (response.Name === googleClientIdName && response.SecretString) {
        GOOGLE_CLIENT_ID_VALUE = response.SecretString;
        logger.debug("Cached GOOGLE_CLIENT_ID_VALUE:", GOOGLE_CLIENT_ID_VALUE);
      }
    });

    return { JWT_SECRET_VALUE, GOOGLE_CLIENT_ID_VALUE };
  } catch (err) {
    /**
     * Logs errors and rethrows them for external handling.
     */
    logger.error("Error retrieving secrets:", err);
    throw err;
  }
};
