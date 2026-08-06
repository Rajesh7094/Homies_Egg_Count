import type { User, EggBatch, ConsumptionRecord, ActivityLog, EmailNotification } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const USERS_KEY = 'bachelor_egg_users_v2';
const BATCHES_KEY = 'bachelor_egg_batches_v2';
const CONSUMPTION_KEY = 'bachelor_egg_consumption_v2';
const ACTIVITIES_KEY = 'bachelor_egg_activities_v2';
const EMAILS_KEY = 'bachelor_egg_emails_v2';

export const ADMIN_EMAIL = 'rajesherode2004@gmail.com';

const INITIAL_USERS: User[] = [
  {
    id: 'u-admin-1',
    user_id: 'RAJ001',
    name: 'Rajesh (Admin)',
    email: ADMIN_EMAIL,
    mobile: '+91 98765 43210',
    role: 'admin',
    status: 'active',
    password: 'rajesh123',
    created_at: new Date().toISOString(),
  },
];

// No pre-loaded batches — Admin will create the first real batch
const INITIAL_BATCHES: EggBatch[] = [];

// No pre-loaded consumption records — all real data from actual use
const INITIAL_CONSUMPTIONS: ConsumptionRecord[] = [];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: 'act-init',
    user: 'System',
    action: 'App Initialized',
    description: 'Bachelor Egg Manager started. Admin can now add users and create the first egg batch.',
    timestamp: new Date().toISOString(),
  },
];

class MockStorageService {
  constructor() {
    this.init();
  }

  private init(): void {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(BATCHES_KEY)) {
      localStorage.setItem(BATCHES_KEY, JSON.stringify(INITIAL_BATCHES));
    }
    if (!localStorage.getItem(CONSUMPTION_KEY)) {
      localStorage.setItem(CONSUMPTION_KEY, JSON.stringify(INITIAL_CONSUMPTIONS));
    }
    if (!localStorage.getItem(ACTIVITIES_KEY)) {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
    }
    if (!localStorage.getItem(EMAILS_KEY)) {
      localStorage.setItem(EMAILS_KEY, JSON.stringify([]));
    }

    // Async sync from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      this.syncFromSupabase();
    }
  }

  // Fetch real-time data from Supabase
  public async syncFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const [usersRes, batchesRes, consumptionsRes, activitiesRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('egg_batches').select('*'),
        supabase.from('consumption').select('*'),
        supabase.from('activity_logs').select('*').order('timestamp', { ascending: false }).limit(100),
      ]);

      if (usersRes.data && usersRes.data.length > 0) {
        localStorage.setItem(USERS_KEY, JSON.stringify(usersRes.data));
      }
      if (batchesRes.data) {
        localStorage.setItem(BATCHES_KEY, JSON.stringify(batchesRes.data));
      }
      if (consumptionsRes.data) {
        localStorage.setItem(CONSUMPTION_KEY, JSON.stringify(consumptionsRes.data));
      }
      if (activitiesRes.data) {
        const mappedLogs = activitiesRes.data.map((a: any) => ({
          ...a,
          user: a.user || a.user_name || 'System'
        }));
        localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(mappedLogs));
      }
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  // User Methods
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  generateCustomUserId(name: string): string {
    const users = this.getUsers();
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const prefix = (cleanName.length >= 3 ? cleanName.substring(0, 3) : cleanName.padEnd(3, 'X'));

    const nextSeq = users.length + 1;
    const seqStr = String(nextSeq).padStart(3, '0');
    return `${prefix}${seqStr}`;
  }

  addUser(userData: Omit<User, 'id' | 'user_id' | 'created_at'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: this.generateCustomUserId(userData.name),
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);

    this.logActivity(
      'Admin',
      'User Created',
      `Added new user ${newUser.name} (${newUser.user_id}) - Email: ${newUser.email}`
    );

    // Sync to Supabase table 'users'
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('users').insert([{
            user_id: newUser.user_id,
            name: newUser.name,
            email: newUser.email,
            mobile: newUser.mobile,
            role: newUser.role,
            status: newUser.status,
            password_hash: newUser.password || 'rajesh123',
          }]);
        } catch (e) {
          console.error('Supabase insert error:', e);
        }
      })();
    }

    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    this.saveUsers(users);

    this.logActivity('Admin', 'User Updated', `Updated details for ${updated.name} (${updated.user_id})`);

    // Sync to Supabase table 'users'
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('users').update({
            name: updated.name,
            email: updated.email,
            mobile: updated.mobile,
            role: updated.role,
            status: updated.status,
          }).eq('user_id', updated.user_id);
        } catch (e) {
          console.error('Supabase update error:', e);
        }
      })();
    }

    return updated;
  }

  deleteUser(id: string): void {
    let users = this.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      users = users.filter(u => u.id !== id);
      this.saveUsers(users);
      this.logActivity('Admin', 'User Deleted', `Deleted user ${user.name} (${user.user_id})`);

      // Sync to Supabase table 'users'
      if (isSupabaseConfigured && supabase) {
        (async () => {
          try {
            await supabase.from('users').delete().eq('user_id', user.user_id);
          } catch (e) {
            console.error('Supabase delete user error:', e);
          }
        })();
      }
    }
  }

  // Batches Methods
  getBatches(): EggBatch[] {
    return JSON.parse(localStorage.getItem(BATCHES_KEY) || '[]');
  }

  saveBatches(batches: EggBatch[]): void {
    localStorage.setItem(BATCHES_KEY, JSON.stringify(batches));
  }

  getActiveBatch(): EggBatch | null {
    const batches = this.getBatches();
    return batches.find(b => b.is_active) || null;
  }

  createNewBatch(totalEggs: number, price: number, adminUserId: string): EggBatch {
    const batches = this.getBatches();

    // Deactivate previous active batches
    const updatedBatches = batches.map(b => ({ ...b, is_active: false }));

    const batchNumberSeq = updatedBatches.length + 1;
    const batchNumber = `Batch-${String(batchNumberSeq).padStart(3, '0')}`;
    const pricePerEgg = Number((price / totalEggs).toFixed(2));

    const newBatch: EggBatch = {
      id: `b-${Date.now()}`,
      batch_number: batchNumber,
      total_eggs: totalEggs,
      price: price,
      price_per_egg: pricePerEgg,
      remaining_eggs: totalEggs,
      is_active: true,
      email_sent: false,
      created_at: new Date().toISOString(),
      created_by: adminUserId,
    };

    updatedBatches.push(newBatch);
    this.saveBatches(updatedBatches);

    this.logActivity(
      'Admin',
      `Created ${batchNumber}`,
      `Added ${totalEggs} eggs at ₹${price} (₹${pricePerEgg}/egg)`
    );

    // Sync to Supabase table 'egg_batches'
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('egg_batches').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('egg_batches').insert([{
            batch_number: newBatch.batch_number,
            total_eggs: newBatch.total_eggs,
            price: newBatch.price,
            price_per_egg: newBatch.price_per_egg,
            remaining_eggs: newBatch.remaining_eggs,
            is_active: true,
            email_sent: false,
            created_by: adminUserId,
          }]);
        } catch (e) {
          console.error('Supabase create batch error:', e);
        }
      })();
    }

    return newBatch;
  }

  updateBatchPrice(batchId: string, newTotalEggs: number, newPrice: number): EggBatch {
    const batches = this.getBatches();
    const idx = batches.findIndex(b => b.id === batchId);
    if (idx === -1) throw new Error('Batch not found');

    const old = batches[idx];
    const pricePerEgg = Number((newPrice / newTotalEggs).toFixed(2));
    const consumedSoFar = old.total_eggs - old.remaining_eggs;
    const newRemaining = Math.max(0, newTotalEggs - consumedSoFar);

    const updated: EggBatch = {
      ...old,
      total_eggs: newTotalEggs,
      price: newPrice,
      price_per_egg: pricePerEgg,
      remaining_eggs: newRemaining,
    };

    batches[idx] = updated;
    this.saveBatches(batches);

    this.logActivity(
      'Admin',
      `Updated ${updated.batch_number}`,
      `Set price to ₹${newPrice} for ${newTotalEggs} eggs (₹${pricePerEgg}/egg)`
    );

    // Sync to Supabase table 'egg_batches'
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('egg_batches').update({
            total_eggs: updated.total_eggs,
            price: updated.price,
            price_per_egg: updated.price_per_egg,
            remaining_eggs: updated.remaining_eggs,
          }).eq('batch_number', updated.batch_number);
        } catch (e) {
          console.error('Supabase update batch error:', e);
        }
      })();
    }

    return updated;
  }

  // Consumption Methods
  getConsumptions(): ConsumptionRecord[] {
    return JSON.parse(localStorage.getItem(CONSUMPTION_KEY) || '[]');
  }

  saveConsumptions(records: ConsumptionRecord[]): void {
    localStorage.setItem(CONSUMPTION_KEY, JSON.stringify(records));
  }

  consumeEgg(user: User): { record: ConsumptionRecord; batchFinished: boolean; emailPayload?: any } {
    const activeBatch = this.getActiveBatch();
    if (!activeBatch) {
      throw new Error('No active egg batch available.');
    }
    if (activeBatch.remaining_eggs <= 0) {
      throw new Error('Egg stock finished! Please wait for Admin to refill.');
    }

    const newRemaining = activeBatch.remaining_eggs - 1;
    const record: ConsumptionRecord = {
      id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: user.id,
      custom_user_id: user.user_id,
      user_name: user.name,
      batch_id: activeBatch.id,
      batch_number: activeBatch.batch_number,
      egg_count: 1,
      price_per_egg: activeBatch.price_per_egg,
      amount: activeBatch.price_per_egg,
      consumed_at: new Date().toISOString(),
    };

    const consumptions = this.getConsumptions();
    consumptions.push(record);
    this.saveConsumptions(consumptions);

    let batchFinished = false;
    let emailPayload = null;

    const batches = this.getBatches();
    const batchIdx = batches.findIndex(b => b.id === activeBatch.id);
    if (batchIdx !== -1) {
      batches[batchIdx].remaining_eggs = newRemaining;

      if (newRemaining === 0) {
        batchFinished = true;
        if (!batches[batchIdx].email_sent) {
          batches[batchIdx].email_sent = true;

          const batchRecords = consumptions.filter(c => c.batch_id === activeBatch.id);
          const summaryMap: Record<string, number> = {};
          batchRecords.forEach(r => {
            summaryMap[r.user_name] = (summaryMap[r.user_name] || 0) + r.egg_count;
          });

          emailPayload = {
            batch_number: activeBatch.batch_number,
            total_consumed: activeBatch.total_eggs,
            user_breakdown: summaryMap,
            admin_email: ADMIN_EMAIL,
          };
        }
      }

      this.saveBatches(batches);
    }

    this.logActivity(
      user.name,
      'Consumed 1 egg',
      `${activeBatch.batch_number} - Remaining stock: ${newRemaining}`
    );

    // Sync to Supabase table 'consumption' & update 'egg_batches'
    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('egg_batches').update({ remaining_eggs: newRemaining }).eq('batch_number', activeBatch.batch_number);
        } catch (e) {
          console.error('Supabase stock update error:', e);
        }
      })();
    }

    return { record, batchFinished, emailPayload };
  }

  // Activities Methods
  getActivities(): ActivityLog[] {
    return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  }

  logActivity(user: string, action: string, description: string): ActivityLog {
    const activities = this.getActivities();
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user,
      action,
      description,
      timestamp: new Date().toISOString(),
    };
    activities.unshift(newLog);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities.slice(0, 200)));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await supabase.from('activity_logs').insert([{
            user: user,
            action: action,
            description: description,
          }]);
        } catch (e) {
          console.error('Supabase log insert error:', e);
        }
      })();
    }

    return newLog;
  }

  // Email Notification Log
  getEmails(): EmailNotification[] {
    return JSON.parse(localStorage.getItem(EMAILS_KEY) || '[]');
  }

  logEmailNotification(email: Omit<EmailNotification, 'id' | 'sent_at'>): EmailNotification {
    const emails = this.getEmails();
    const newEmail: EmailNotification = {
      ...email,
      id: `eml-${Date.now()}`,
      sent_at: new Date().toISOString(),
    };
    emails.unshift(newEmail);
    localStorage.setItem(EMAILS_KEY, JSON.stringify(emails));
    return newEmail;
  }

  resetToDefaults(): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(BATCHES_KEY, JSON.stringify(INITIAL_BATCHES));
    localStorage.setItem(CONSUMPTION_KEY, JSON.stringify(INITIAL_CONSUMPTIONS));
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(EMAILS_KEY, JSON.stringify([]));

    if (isSupabaseConfigured && supabase) {
      (async () => {
        try {
          await Promise.all([
            supabase.from('users').delete().neq('email', ADMIN_EMAIL),
            supabase.from('egg_batches').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('consumption').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
            supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
          ]);
        } catch (e) {
          console.error('Supabase purge error:', e);
        }
      })();
    }
  }
}

export const mockStorage = new MockStorageService();
