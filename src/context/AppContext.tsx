import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, EggBatch, ConsumptionRecord, ActivityLog, HouseholdSummary, EmailNotification } from '../types';
import { mockStorage } from '../services/mockStorage';
import { sendEggFinishedEmail } from '../services/emailService';
import confetti from 'canvas-confetti';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  batches: EggBatch[];
  activeBatch: EggBatch | null;
  consumptions: ConsumptionRecord[];
  activities: ActivityLog[];
  emailLogs: EmailNotification[];
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  consumeEgg: (user: User) => Promise<boolean>;
  refillStock: (totalEggs: number, price: number, adminUserId: string) => void;
  updateActiveBatchPrice: (newTotalEggs: number, newPrice: number) => void;
  addUser: (userData: Omit<User, 'id' | 'user_id' | 'created_at'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetAllData: () => void;
  refreshData: () => void;
  getUserConsumptionCount: (userId: string, batchId?: string) => number;
  getUserTodayConsumptionCount: (userId: string) => number;
  getUserPendingAmount: (userId: string) => number;
  getHouseholdSummary: () => HouseholdSummary;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<EggBatch[]>([]);
  const [consumptions, setConsumptions] = useState<ConsumptionRecord[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const refreshData = useCallback(() => {
    setBatches(mockStorage.getBatches());
    setConsumptions(mockStorage.getConsumptions());
    setActivities(mockStorage.getActivities());
    setEmailLogs(mockStorage.getEmails());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addToast = (type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const activeBatch = batches.find(b => b.is_active) || null;

  const consumeEgg = async (user: User): Promise<boolean> => {
    try {
      const { batchFinished, emailPayload } = mockStorage.consumeEgg(user);
      
      // Trigger subtle confetti burst for smooth UX
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.8 },
      });

      refreshData();
      addToast('success', `Recorded +1 Egg for ${user.name}!`);

      if (batchFinished) {
        addToast('error', '⚠️ Egg Stock is now completely Finished!');
        if (emailPayload) {
          await sendEggFinishedEmail(emailPayload);
          addToast('info', `📧 Automated Refill Alert sent to ${emailPayload.admin_email}`);
          refreshData();
        }
      } else if (activeBatch && activeBatch.remaining_eggs - 1 <= 5) {
        addToast('warning', `⚠️ Low Egg Stock! Only ${activeBatch.remaining_eggs - 1} eggs left.`);
      }

      return true;
    } catch (err: any) {
      addToast('error', err.message || 'Failed to record consumption');
      return false;
    }
  };

  const refillStock = (totalEggs: number, price: number, adminUserId: string) => {
    const newBatch = mockStorage.createNewBatch(totalEggs, price, adminUserId);
    refreshData();
    addToast('success', `Created ${newBatch.batch_number} with ${totalEggs} eggs at ₹${price}`);
  };

  const updateActiveBatchPrice = (newTotalEggs: number, newPrice: number) => {
    if (!activeBatch) {
      addToast('error', 'No active batch found to update.');
      return;
    }
    mockStorage.updateBatchPrice(activeBatch.id, newTotalEggs, newPrice);
    refreshData();
    addToast('success', `Updated ${activeBatch.batch_number} price to ₹${newPrice}`);
  };

  const addUser = (userData: Omit<User, 'id' | 'user_id' | 'created_at'>): User => {
    const newUser = mockStorage.addUser(userData);
    refreshData();
    window.dispatchEvent(new CustomEvent('bachelor-users-changed'));
    addToast('success', `User ${newUser.name} created with ID ${newUser.user_id}`);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updated = mockStorage.updateUser(id, updates);
    refreshData();
    window.dispatchEvent(new CustomEvent('bachelor-users-changed'));
    addToast('success', `Updated status/details for ${updated.name}`);
  };

  const deleteUser = (id: string) => {
    mockStorage.deleteUser(id);
    refreshData();
    window.dispatchEvent(new CustomEvent('bachelor-users-changed'));
    addToast('info', 'User removed successfully');
  };

  const resetAllData = () => {
    mockStorage.resetToDefaults();
    refreshData();
    window.dispatchEvent(new CustomEvent('bachelor-users-changed'));
    addToast('info', 'System reset to default seed state.');
  };


  const getUserConsumptionCount = (userId: string, batchId?: string): number => {
    return consumptions
      .filter(c => c.user_id === userId && (!batchId || c.batch_id === batchId))
      .reduce((sum, c) => sum + c.egg_count, 0);
  };

  const getUserTodayConsumptionCount = (userId: string): number => {
    const todayStr = new Date().toISOString().split('T')[0];
    return consumptions
      .filter(c => c.user_id === userId && c.consumed_at.startsWith(todayStr))
      .reduce((sum, c) => sum + c.egg_count, 0);
  };

  const getUserPendingAmount = (userId: string): number => {
    return consumptions
      .filter(c => c.user_id === userId)
      .reduce((sum, c) => sum + c.amount, 0);
  };

  const getHouseholdSummary = (): HouseholdSummary => {
    const totalEggsPurchased = batches.reduce((sum, b) => sum + b.total_eggs, 0);
    const totalEggsConsumed = consumptions.reduce((sum, c) => sum + c.egg_count, 0);
    const currentRemainingEggs = activeBatch ? activeBatch.remaining_eggs : 0;
    const totalPendingAmount = consumptions.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalEggsPurchased,
      totalEggsConsumed,
      currentRemainingEggs,
      totalPendingAmount,
      activeBatchNumber: activeBatch ? activeBatch.batch_number : 'None',
      activePricePerEgg: activeBatch ? activeBatch.price_per_egg : 0,
      activeBatchTotalEggs: activeBatch ? activeBatch.total_eggs : 0,
    };
  };

  return (
    <AppContext.Provider
      value={{
        batches,
        activeBatch,
        consumptions,
        activities,
        emailLogs,
        toasts,
        addToast,
        removeToast,
        consumeEgg,
        refillStock,
        updateActiveBatchPrice,
        addUser,
        updateUser,
        deleteUser,
        resetAllData,
        refreshData,
        getUserConsumptionCount,
        getUserTodayConsumptionCount,
        getUserPendingAmount,
        getHouseholdSummary,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
