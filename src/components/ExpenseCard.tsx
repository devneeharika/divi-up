import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import type { Expense } from "@/src/types/models";

type Props = {
  expense: Expense;
  onPress?: () => void;
};

export function ExpenseCard({ expense, onPress }: Props) {
  const date = new Date(expense.date || expense.createdAt);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const groupLabel = expense.groupName ?? "Personal";
  const peopleCount = expense.splits?.length ?? 1;
  const perPerson =
    peopleCount > 0 ? expense.totalAmount / peopleCount : expense.totalAmount;

  // Temporary status until you add a real field
  const status = "pending" as const;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        {/* Left side: date + title + meta */}
        <View style={styles.left}>
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={1}>
              {expense.description || "Untitled expense"}
            </Text>
            <View style={[styles.statusPill, status === "pending" ? styles.pending : styles.settled]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateMonth}>{month}</Text>
              <Text style={styles.dateDay}>{day}</Text>
              <Text style={styles.dateYear}>{year}</Text>
            </View>

            <View style={styles.metaTextBlock}>
              <Text style={styles.metaLine} numberOfLines={1}>
                {"\u2022"}  {peopleCount} people  {"\u2022"}  {groupLabel}
              </Text>
              <Text style={styles.metaSubLine} numberOfLines={1}>
                {perPerson.toFixed(2)} {expense.currency}/person
              </Text>
            </View>
          </View>
        </View>

        {/* Right side: amount + chevron */}
        <View style={styles.right}>
          <Text style={styles.amount}>
            ${expense.totalAmount.toFixed(2)}
          </Text>
          <Text style={styles.currency}>{expense.currency}</Text>
          <Text style={styles.chevron}>{">"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  pending: {
    backgroundColor: "#FFE9B3",
  },
  settled: {
    backgroundColor: "#CFF7CF",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "lowercase",
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  dateBlock: {
    marginRight: 12,
    alignItems: "flex-start",
  },
  dateMonth: {
    fontSize: 12,
    color: "#666",
  },
  dateDay: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateYear: {
    fontSize: 12,
    color: "#666",
  },
  metaTextBlock: {
    flex: 1,
  },
  metaLine: {
    fontSize: 13,
    color: "#444",
  },
  metaSubLine: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
  },
  currency: {
    fontSize: 12,
    color: "#555",
  },
  chevron: {
    marginTop: 4,
    fontSize: 16,
    color: "#999",
  },
});
