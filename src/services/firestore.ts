import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  ExpenseSummary,
  ExpenseTransaction,
  ExpenseView,
  CreateExpenseInput,
  ExpenseStatus,
} from "@/src/types/models";

const EXPENSES_COLLECTION = "expenses";
const TRANSACTIONS_SUBCOLLECTION = "transactions";
const GROUPS_COLLECTION = "groups";
  
export const createExpenseWithTransaction = async (
  input: CreateExpenseInput
): Promise<ExpenseView> => {
  const now = Timestamp.now();
  const status: ExpenseStatus = input.status ?? "pending";

  // 1) Create summary
  const summaryRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
    groupId: input.groupId ?? null,
    groupName: input.groupName ?? null,
    description: input.description,
    totalAmount: input.totalAmount,
    currency: input.currency,
    paidBy: input.paidBy,
    payerName: input.payerName ?? null,
    status,
    participantCount: input.splits.length,
    date: input.date,
    createdAt: now,
  });

  const expenseId = summaryRef.id;

  // 2) Create first transaction
  const txRef = await addDoc(
    collection(summaryRef, TRANSACTIONS_SUBCOLLECTION),
    {
      expenseId,
      version: 1,
      subtotal: input.subtotal,
      tax: input.tax,
      tip: input.tip,
      splitMethod: input.splitMethod,
      splits: input.splits,
      itemizedItems: input.itemizedItems ?? null,
      createdBy: input.paidBy,
      createdAt: now,
    }
  );

  const summarySnap = await getDoc(summaryRef);
  const txSnap = await getDoc(txRef);

  return {
    summary: parseSummaryDoc(summarySnap),
    latestTransaction: parseTransactionDoc(txSnap),
  };
};
  
export const listExpenseSummariesForUser = async (
  userId: string
): Promise<ExpenseSummary[]> => {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where("paidBy", "==", userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => parseSummaryDoc(d));
};

export const getExpenseView = async (
  expenseId: string
): Promise<ExpenseView | null> => {
  const summaryRef = doc(db, EXPENSES_COLLECTION, expenseId);
  const summarySnap = await getDoc(summaryRef);
  if (!summarySnap.exists()) return null;

  const txQuery = query(
    collection(summaryRef, TRANSACTIONS_SUBCOLLECTION),
    orderBy("version", "desc"),
    limit(1)
  );
  const txSnap = await getDocs(txQuery);

  const latestTx =
    txSnap.docs.length > 0 ? parseTransactionDoc(txSnap.docs[0]) : null;

  return {
    summary: parseSummaryDoc(summarySnap),
    latestTransaction: latestTx,
  };
};
  
const parseSummaryDoc = (snap: any): ExpenseSummary => {
  const data = snap.data() as any;
  return {
    id: snap.id,
    groupId: data.groupId ?? null,
    groupName: data.groupName ?? null,
    description: data.description ?? "",
    totalAmount:
      typeof data.totalAmount === "number" ? data.totalAmount : 0,
    currency: data.currency ?? "USD",
    paidBy: data.paidBy ?? "",
    payerName: data.payerName ?? null,
    status: data.status ?? "pending",
    participantCount: typeof data.participantCount === "number" ? data.participantCount : 1,
    date: data.date ?? new Date().toISOString().slice(0, 10),
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toISOString()
      : new Date().toISOString(),
  };
};

const parseTransactionDoc = (snap: any): ExpenseTransaction => {
  const data = snap.data() as any;
  const createdAtIso = data.createdAt?.toDate
    ? data.createdAt.toDate().toISOString()
    : new Date().toISOString();

  return {
    id: snap.id,
    expenseId: data.expenseId ?? "",
    version: typeof data.version === "number" ? data.version : 1,
    subtotal: typeof data.subtotal === "number" ? data.subtotal : 0,
    tax: typeof data.tax === "number" ? data.tax : 0,
    tip: typeof data.tip === "number" ? data.tip : 0,
    splitMethod: data.splitMethod ?? "equal",
    splits: Array.isArray(data.splits) ? data.splits : [],
    itemizedItems: data.itemizedItems ?? null,
    createdBy: data.createdBy ?? "",
    createdAt: createdAtIso,
  };
};
  