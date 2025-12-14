export type UserProfile = {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    createdAt?: string; // ISO string
  };
  
  export type Group = {
    id: string;
    name: string;
    createdBy: string; // uid
    members: string[]; // array of uids
    createdAt: string; // ISO string
  };
  
  export type SplitMethod = "equal" | "itemized" | "custom" | "percentage";
  export type TransactionType = "they_owe_me" | "i_owe_them";
  
  export type Split = {
    participantId: string;
    participantName: string;
    amountOwed: number;
    splitMethod: SplitMethod;
  };
  
  export type ItemizedItem = {
    name: string;
    amount: number;
    splitAcross: string[]; // array of participantIds
  };
  
  export type Expense = {
    id: string;
    groupId: string | null;
    groupName?: string | null; // denormalized
    description: string;
    totalAmount: number;
    subtotal: number;
    tax: number;
    tip: number;
    currency: string;
    paidBy: string; // uid
    transactionType: TransactionType; // "they_owe_me" | "i_owe_them"
    splits: Split[]; // array of participant splits
    splitMethod: SplitMethod;
    itemizedItems?: ItemizedItem[] | null; // only if splitMethod = "itemized"
    createdAt: string; // ISO string
    date: string; // ISO date string (Dec 7, 2025 → 2025-12-07)
  };
  
  export type CreateExpenseInput = {
    groupId?: string | null;
    groupName?: string | null;
    description: string;
    totalAmount: number;
    subtotal: number;
    tax: number;
    tip: number;
    currency: string;
    paidBy: string; // uid
    transactionType: "they_owe_me" | "i_owe_them";
    splits: Split[];
    splitMethod: "equal" | "itemized" | "custom" | "percentage";
    itemizedItems?: ItemizedItem[] | null;
    date: string; // ISO date string
  };