// src/contexts/UserContext.tsx
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = "http://192.168.8.65:5000/api";

// ------------------ Types ------------------
export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  balance: number;
  profileImage?: string;
  rewardPoints: number;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  date: string;
  recipient?: string;
  sender?: string;
  status: 'completed' | 'pending' | 'failed';
  // peerEmail is used by backend as peer
}

export interface Product {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  image: string;
  category: string;
}

const STORAGE_KEYS = {
  USER: '@banking_app_user',
  TRANSACTIONS: '@banking_app_transactions',
  IS_LOGGED_IN: '@banking_app_is_logged_in',
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- local loader
  const loadUserData = useCallback(async () => {
    try {
      const [storedUser, storedTransactions, storedIsLoggedIn] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
      if (storedIsLoggedIn) setIsLoggedIn(JSON.parse(storedIsLoggedIn));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Helper: fetch user from backend and update local cache
  const fetchUserAndTxs = useCallback(async (email: string | undefined) => {
    if (!email) return;
    try {
      const userRes = await fetch(`${API_BASE}/users/${encodeURIComponent(email)}`);
      if (!userRes.ok) throw new Error('Failed to fetch user');
      const userJson = await userRes.json();

      const txRes = await fetch(`${API_BASE}/transactions/${encodeURIComponent(email)}`);
      const txsJson = txRes.ok ? await txRes.json() : [];

      const normalizedUser: User = {
        id: userJson._id || userJson.id || userJson.email,
        name: userJson.name,
        email: userJson.email,
        phone: userJson.phone,
        balance: userJson.balance ?? 0,
        profileImage: userJson.profileImage,
        rewardPoints: userJson.rewardPoints ?? 0,
      };

      setUser(normalizedUser);
      const allUsersRes = await fetch(`${API_BASE}/users`);
      const allUsers = allUsersRes.ok ? await allUsersRes.json() : [];
      const emailToName = Object.fromEntries(allUsers.map((u: any) => [u.email, u.name]));

      setTransactions(
        txsJson.map((t: any) => ({
          id: t._id || t.id,
          type: t.type,
          amount: t.amount,
          date: t.date,
          recipient:
            t.type === 'send'
              ? emailToName[t.peerEmail] || t.peerEmail
              : undefined,
          sender:
            t.type === 'receive'
              ? emailToName[t.peerEmail] || t.peerEmail
              : undefined,
          status: t.status,
        }))
      );

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txsJson));
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(true));
      setIsLoggedIn(true);
    } catch (err) {
      console.error('fetchUserAndTxs error:', err);
    }
  }, []);

  // ------------------ Register
  const register = useCallback(async (userData: Omit<User, 'id' | 'balance' | 'rewardPoints'>) => {
    try {
      const body = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      };
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register');
      }
      const created = await res.json();
      // Normalise and save locally
      const normalizedUser: User = {
        id: created._id || created.id || created.email,
        name: created.name,
        email: created.email,
        phone: created.phone,
        balance: created.balance ?? 0,
        profileImage: created.profileImage,
        rewardPoints: created.rewardPoints ?? 0,
      };

      setUser(normalizedUser);
      setTransactions([]); // new user starts with empty txs
      setIsLoggedIn(true);

      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, JSON.stringify(true));

      return true;
    } catch (err) {
      console.error('register error:', err);
      return false;
    }
  }, []);

  // ------------------ Login
  const login = useCallback(async (email: string) => {
    try {
      await fetchUserAndTxs(email);
      return true;
    } catch (err) {
      console.error('login error:', err);
      return false;
    }
  }, [fetchUserAndTxs]);

  // ------------------ Logout
  const logout = useCallback(async () => {
    setUser(null);
    setTransactions([]);
    setIsLoggedIn(false);
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TRANSACTIONS, STORAGE_KEYS.IS_LOGGED_IN]);
  }, []);

  // ------------------ Update user locally (cache)
  const updateUser = useCallback(async (updates: Partial<User>) => {
  if (!user) return;
  try {
    const body = {
      email: user.email,
      name: updates.name || user.name,
      phone: updates.phone || user.phone,
    };

    const res = await fetch(`${API_BASE}/users/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to update profile');
    }

    const data = await res.json();

    // backend returns { message, user }
    setUser(data.user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  } catch (err) {
    console.error('updateUser error:', err);
  }
}, [user]);

  // ------------------ addTransaction (send / receive)
  const addTransaction = useCallback(
  async (transaction: Omit<Transaction, 'id' | 'date' | 'status'>) => {
    if (!user) return false;

    try {
      let res;
      if (transaction.type === 'send') {
        const payload = {
          senderEmail: user.email,
          recipientIdentifier: transaction.recipient,
          amount: transaction.amount,
        };

        res = await fetch(`${API_BASE}/transactions/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else if (transaction.type === 'receive') {
        const payload = { receiverEmail: user.email, amount: transaction.amount };
        res = await fetch(`${API_BASE}/transactions/receive`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res) throw new Error('Network error');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Transaction failed');
      }

      // Refresh after successful transaction
      await fetchUserAndTxs(user.email);
      return true;
    } catch {
      // Optional: you can set an error state here to show a modal
      return false;
    }
  },
  [user, fetchUserAndTxs]
);


  // ------------------ redeemProduct (local only for now)
  const redeemProduct = useCallback(async (product: Product) => {
  if (!user || user.rewardPoints < product.pointsRequired) return false;

  try {
    const res = await fetch(`${API_BASE}/users/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        points: product.pointsRequired,
        productName: product.name,
      }),
    });

    if (!res.ok) throw new Error('Redeem failed');
    const updatedUser = await res.json();

    await updateUser({
      rewardPoints: updatedUser.rewardPoints,
    });

    await fetch(`${API_BASE}/notifications/reward-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        productName: product.name,
        pointsUsed: product.pointsRequired,
      }),
    });

    return true;
  } catch {
    return false;
  }
}, [user, updateUser]);


  // ------------------ Loan Request 

  const submitLoanRequest = useCallback(async (loanData: { amount: number; duration: number; purpose: string }) => {
  if (!user) return false;
  try {
    const res = await fetch(`${API_BASE}/loans/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...loanData, email: user.email }),
    });
    if (!res.ok) throw new Error('Loan request failed');

    // backend also sends email confirmation
    return true;
  } catch {
    return false;
  }
}, [user]);

  
  // ------------------ Optional: Sync on app start / when user email changes
  useEffect(() => {
    const syncUserFromServer = async () => {
      if (!user?.email) return;
      try {
        await fetchUserAndTxs(user.email);
      } catch (err) {
        console.error('syncUserFromServer error:', err);
      }
    };

    syncUserFromServer();
  }, [user?.email, fetchUserAndTxs]);

  // Poll for new data every 10 seconds if logged in
useEffect(() => {
  if (!user?.email) return;

  const interval = setInterval(() => {
    fetchUserAndTxs(user.email);
  }, 12000); // 12 seconds

  return () => clearInterval(interval);
}, [user?.email, fetchUserAndTxs]);


  // ------------------ Return context value
  return useMemo(
    () => ({
      user,
      transactions,
      isLoggedIn,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      addTransaction,
      redeemProduct,
      submitLoanRequest
    }),
    [user, transactions, isLoggedIn, isLoading, login, register, logout, updateUser, addTransaction, redeemProduct,submitLoanRequest]
  );
});