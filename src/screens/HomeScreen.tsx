import { StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Image } from "expo-image";
import { auth } from "@/src/services/firebase";
import { useAuthStore } from "@/src/store/authStore";
import { signInAnonymously, signOut } from "firebase/auth";
import { Expense } from "@/src/types/models";
import { ExpenseCard } from "@/src/components/ExpenseCard";
import {
  createExpense,
  listExpensesForUser,
} from "@/src/services/firestore";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const handleAddTestExpense = async () => {
    if (!user?.uid) return;

    console.log("[TestExpense] start create");  // debug
    try {
      setLoadingExpenses(true);

      await createExpense({
        groupId: null,
        groupName: null,
        description: "Test dinner",
        totalAmount: 130,
        subtotal: 107,
        tax: 8,
        tip: 15,
        currency: "USD",
        paidBy: user.uid,
        transactionType: "they_owe_me",
        splitMethod: "equal",
        splits: [
          {
            participantId: user.uid,
            participantName: user.email ?? "Me",
            amountOwed: 26,
            splitMethod: "equal",
          },
        ],
        itemizedItems: null,
        date: new Date().toISOString().slice(0, 10),
      });

      console.log("[TestExpense] created, fetching list");

      const fresh = await listExpensesForUser(user.uid);
      console.log("[TestExpense] fetched", fresh.length, "expenses");
      setExpenses(fresh);
    } catch (e) {
      console.error("[TestExpense] error", e);
    } finally {
      setLoadingExpenses(false);
    }
  };

  useEffect(() => {
    // Reset state when user logs out / changes
    if (!user?.uid) {
      console.log("[Expenses] no user, clearing");
      setLoadingExpenses(false);
      setExpenses([]);
      return;
    }

    const fetchInitial = async () => {
      console.log("[Expenses] fetchInitial for", user.uid);
      setLoadingExpenses(true);
      try {
        const fresh = await listExpensesForUser(user.uid);
        console.log("[Expenses] initial count", fresh.length);
        setExpenses(fresh);
      } catch (e) {
        console.error("[Expenses] error", e);
      } finally {
        setLoadingExpenses(false);
      }
    };

    fetchInitial();
  }, [user?.uid]);

  const handleExpensePress = (expenseId: string) => {
    console.log("[ExpenseCard] tapped", expenseId);
    // Future: navigate to expense detail screen with this id
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">DiviUp - My Expenses</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Overview</ThemedText>
        <ThemedText>
          This screen will show your recent group expenses, who owes who, and
          which items are pending or settled. Latest!
        </ThemedText>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Auth debug</ThemedText>
          {initializing ? (
            <ThemedText>Checking auth state...</ThemedText>
          ) : user ? (
            <>
              <ThemedText>Signed in as: {user.uid}</ThemedText>
              <Button title="Sign out" onPress={handleSignOut} />
            </>
          ) : (
            <>
              <ThemedText>You are not signed in.</ThemedText>
              <Button title="Sign in anonymously" onPress={handleAnonSignIn} />
            </>
          )}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Test expenses</ThemedText>
        <Button
          title={loadingExpenses ? "Loading..." : "Add test expense"}
          onPress={handleAddTestExpense}
          disabled={loadingExpenses || !user?.uid}
        />
        {expenses.map((exp) => (
          <ExpenseCard
            key={exp.id}
            expense={exp}
            onPress={() => handleExpensePress(exp.id)}
          />
        ))}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Next up</ThemedText>
        <ThemedText>
          We will replace this placeholder with real expense cards connected to
          Firebase.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

async function handleAnonSignIn() {
  try {
    await signInAnonymously(auth);
  } catch (e) {
    console.error("Anon sign-in error", e);
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Sign-out error", e);
  }
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  section: {
    gap: 8,
    marginBottom: 12,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
