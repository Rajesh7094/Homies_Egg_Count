export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  user_id: string; // E.g., RAJ001, HAR002
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  created_at: string;
}

export interface EggBatch {
  id: string;
  batch_number: string; // E.g., Batch-001
  total_eggs: number;
  price: number; // E.g., 210
  price_per_egg: number; // E.g., 7.00
  remaining_eggs: number;
  is_active: boolean;
  email_sent: boolean;
  created_at: string;
  created_by: string;
}

export interface ConsumptionRecord {
  id: string;
  user_id: string; // Internal User ID
  custom_user_id: string; // E.g. RAJ001
  user_name: string;
  batch_id: string;
  batch_number: string;
  egg_count: number;
  price_per_egg: number;
  amount: number;
  consumed_at: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface EmailNotification {
  id: string;
  batch_number: string;
  recipient: string;
  subject: string;
  body: string;
  sent_at: string;
  status: 'sent' | 'simulated' | 'failed';
}

export interface HouseholdSummary {
  totalEggsPurchased: number;
  totalEggsConsumed: number;
  currentRemainingEggs: number;
  totalPendingAmount: number;
  activeBatchNumber: string;
  activePricePerEgg: number;
  activeBatchTotalEggs: number;
}
