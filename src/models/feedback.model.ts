export enum Author {
  User = "User",
  Admin = "Admin",
}

export enum FeedbackStatus {
  Submitted = "Submitted",
  Resolving = "Resolving",
  Resolved = "Resolved",
}

export interface Message {
  message: string;
  author: Author;
  createdAt: number;
}

export interface Feedback {
  id: string; // Primary key (user id)
  createdAt: number; // Sort key (epoch number)
  description: string;
  updatedAt: number;
  messages: Message[]; // This stores the conversation between the user and the admin on feedback, kind of like a chat on issue.
  metadata: string; // This stores any additional information about the feedback, like on which page it was submitted. i.e page url or page name.
  feedbackStatus: FeedbackStatus;
}
