/**
 * Represents an invitation to join a group.
 *
 * @interface GroupInvite
 *
 * @property {string} id - The unique identifier for the group invite.
 * @property {string} group_id - The unique identifier for the group.
 * @property {string} creator_id - The unique identifier for the user who created the invite.
 * @property {Date} expiry - The expiration date and time of the invite.
 * @property {Date} created_at - The date and time when the invite was created.
 * @property {Date} updated_at - The date and time when the invite was last updated.
 */
export interface GroupInvite {
  id: string;
  group_id: string;
  creator_id: string;
  expiry: number;
  created_at: number;
  updated_at: number;
}

export default GroupInvite;
