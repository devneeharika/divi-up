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
  
  export type ExpenseStatus = "pending" | "settled";

  export type ExpenseSummary = {
    id: string;
    groupId: string | null;
    groupName?: string | null;

    description: string;
    totalAmount: number;
    currency: string;

    paidBy: string; // uid
    payerName?: string | null;

    status: ExpenseStatus;
    participantCount: number;

    date: string; // "YYYY-MM-DD"
    createdAt: string; // ISO string
  };

  export type ExpenseTransaction = {
    id: string;

    expenseId: string; // parent summary id
    version: number; // start at 1

    subtotal: number;
    tax: number;
    tip: number;

    splitMethod: SplitMethod;
    splits: Split[];
    itemizedItems?: ItemizedItem[] | null;

    createdBy: string; // uid
    createdAt: string; // ISO string
  };

  export type ExpenseView = {
    summary: ExpenseSummary;
    latestTransaction: ExpenseTransaction | null;
  };

  export type CreateExpenseInput = {
    groupId?: string | null;
    groupName?: string | null;

    description: string;
    totalAmount: number;
    currency: string;

    paidBy: string;
    payerName?: string | null;

    status?: ExpenseStatus; // default "pending"
    date: string;

    subtotal: number;
    tax: number;
    tip: number;

    splitMethod: SplitMethod;
    splits: Split[];
    itemizedItems?: ItemizedItem[] | null;
  };