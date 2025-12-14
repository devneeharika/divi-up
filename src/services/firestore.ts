import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    Timestamp,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { Expense, Split, ItemizedItem, CreateExpenseInput } from "@/src/types/models";
  
  const EXPENSES_COLLECTION = "expenses";
  const GROUPS_COLLECTION = "groups";
  
  /**
   * Create a new expense in Firestore
   */
  export const createExpense = async (
    input: CreateExpenseInput
  ): Promise<string> => {
    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
      groupId: input.groupId ?? null,
      groupName: input.groupName ?? null,
      description: input.description,
      totalAmount: input.totalAmount,
      subtotal: input.subtotal,
      tax: input.tax,
      tip: input.tip,
      currency: input.currency,
      paidBy: input.paidBy,
      transactionType: input.transactionType,
      splits: input.splits,
      splitMethod: input.splitMethod,
      itemizedItems: input.itemizedItems ?? null,
      date: input.date,
      createdAt: Timestamp.now(),
    });
  
    return docRef.id;
  };
  
  /**
   * Get all expenses where the current user paid
   */
  export const listExpensesWhereUserPaid = async (
    userId: string
  ): Promise<Expense[]> => {
    const q = query(
      collection(db, EXPENSES_COLLECTION),
      where("paidBy", "==", userId)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => parseExpenseDoc(doc));
  };
  
  /**
   * Get all expenses for a group
   */
  export const listExpensesForGroup = async (
    groupId: string
  ): Promise<Expense[]> => {
    const q = query(
      collection(db, EXPENSES_COLLECTION),
      where("groupId", "==", groupId)
    );
  
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => parseExpenseDoc(doc));
  };
  
  /**
   * Get all expenses where the user is involved (as participant or payer)
   */
  export const listExpensesForUser = async (userId: string): Promise<Expense[]> => {
    // Query 1: User paid for the expense
    const paidQ = query(
      collection(db, EXPENSES_COLLECTION),
      where("paidBy", "==", userId)
    );
  
    // Query 2: User is in the splits
    const splitQ = query(
      collection(db, EXPENSES_COLLECTION),
      where("splits", "array-contains", { participantId: userId })
    );
  
    const [paidSnap, splitSnap] = await Promise.all([
      getDocs(paidQ),
      getDocs(splitQ),
    ]);
  
    // Combine and deduplicate
    const expenseMap = new Map<string, Expense>();
  
    paidSnap.docs.forEach((doc) => {
      expenseMap.set(doc.id, parseExpenseDoc(doc));
    });
  
    splitSnap.docs.forEach((doc) => {
      expenseMap.set(doc.id, parseExpenseDoc(doc));
    });
  
    return Array.from(expenseMap.values());
  };
  
  /**
   * Get a single expense by ID
   */
  export const getExpense = async (expenseId: string): Promise<Expense | null> => {
    const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
    const snapshot = await getDoc(docRef);
  
    if (!snapshot.exists()) return null;
    return parseExpenseDoc(snapshot);
  };
  
  /**
   * Update an expense
   */
  export const updateExpense = async (
    expenseId: string,
    updates: Partial<CreateExpenseInput>
  ): Promise<void> => {
    const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
    await updateDoc(docRef, updates as any);
  };
  
  /**
   * Delete an expense
   */
  export const deleteExpense = async (expenseId: string): Promise<void> => {
    const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
    await deleteDoc(docRef);
  };
  
  /**
   * Helper: Parse Firestore doc snapshot into Expense type
   */
  const parseExpenseDoc = (snapshot: any): Expense => {
    const data = snapshot.data() as any;
  
    return {
      id: snapshot.id,
      groupId: data.groupId ?? null,
      groupName: data.groupName ?? null,
      description: data.description ?? "",
      totalAmount: typeof data.totalAmount === "number" ? data.totalAmount : 0,
      subtotal: typeof data.subtotal === "number" ? data.subtotal : 0,
      tax: typeof data.tax === "number" ? data.tax : 0,
      tip: typeof data.tip === "number" ? data.tip : 0,
      currency: data.currency ?? "USD",
      paidBy: data.paidBy ?? "",
      transactionType: data.transactionType ?? "they_owe_me",
      splits: Array.isArray(data.splits) ? data.splits : [],
      splitMethod: data.splitMethod ?? "equal",
      itemizedItems: data.itemizedItems ?? null,
      date: data.date ?? new Date().toISOString(),
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toISOString()
        : new Date().toISOString(),
    } as Expense;
  };
  