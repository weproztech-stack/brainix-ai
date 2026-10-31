import React, { useState, useEffect, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  TrendingUp,
  X
} from "lucide-react-native";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#8547FB";
const BRAND_PURPLE_LIGHT = "rgba(133, 71, 251, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(133, 71, 251, 0.22)";

export default function TeacherWalletScreen({ setScreen }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live Wallet Balances
  const [availableBalance, setAvailableBalance] = useState(0);
  const [escrowPendingBalance, setEscrowPendingBalance] = useState(0);
  const [totalLifetimeEarnings, setTotalLifetimeEarnings] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Withdrawal Modal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("faculty@upi");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  // 📥 1. Live Fetch Wallet Data from Database
  const fetchWalletData = async () => {
    try {
      const res = await apiFetch("/teacher/wallet");
      if (res && res.success && res.wallet) {
        setAvailableBalance(res.wallet.available_balance || 0);
        setEscrowPendingBalance(res.wallet.escrow_pending || 0);
        setTotalLifetimeEarnings(res.wallet.lifetime_earnings || 0);
        setTransactions(res.wallet.transactions || []);
      }
    } catch (error) {
      console.log("Wallet fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWalletData();
  }, []);

  // 💸 2. Handle Live Payout Request
  const handleWithdrawalRequest = async () => {
    const amt = parseFloat(withdrawAmount);

    if (!amt || isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payout amount.");
      return;
    }

    if (amt > availableBalance) {
      Alert.alert("Insufficient Balance", "Requested amount exceeds your available balance.");
      return;
    }

    if (amt < 100) {
      Alert.alert("Minimum Limit", "Minimum payout withdrawal limit is ₹100.");
      return;
    }

    if (!upiId.trim() || !upiId.includes("@")) {
      Alert.alert("Invalid UPI", "Please enter a valid UPI address (e.g. name@okhdfcbank).");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await apiFetch("/teacher/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({
          amount: amt,
          upi_id: upiId.trim()
        })
      });

      if (res && res.success) {
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        Alert.alert(
          "🎉 Payout Initiated!",
          `₹${amt} has been dispatched to your UPI address (${upiId}).`
        );
        fetchWalletData();
      } else {
        Alert.alert("Withdrawal Notice", res?.message || "Could not process payout.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not connect to payment gateway server.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <Header title="Wallet & Earnings" onBack={() => setScreen("teacher_home")} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[BRAND_PURPLE]} />}
      >
        {loading ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={BRAND_PURPLE} />
            <Text style={styles.loaderText}>Syncing wallet ledger records...</Text>
          </View>
        ) : (
          <>
            {/* 💳 Main Elevated Balance Card */}
            <View style={styles.mainBalanceCard}>
              <View style={styles.balanceTopRow}>
                <View>
                  <Text style={styles.balanceLabel}>AVAILABLE FOR WITHDRAWAL</Text>
                  <Text style={styles.balanceAmountText}>₹{availableBalance.toLocaleString()}</Text>
                </View>
                <View style={styles.walletIconCircle}>
                  <Wallet size={24} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.balanceDivider} />

              {/* Escrow & Lifetime Metric Counters */}
              <View style={styles.metricGrid}>
                <View style={styles.metricItem}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Clock size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metricLabel}>Escrow Pending</Text>
                  </View>
                  <Text style={styles.metricValue}>₹{escrowPendingBalance.toLocaleString()}</Text>
                </View>

                <View style={styles.metricItemRight}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <TrendingUp size={12} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.metricLabel}>Lifetime Earnings</Text>
                  </View>
                  <Text style={styles.metricValue}>₹{totalLifetimeEarnings.toLocaleString()}</Text>
                </View>
              </View>

              {/* Withdraw Payout CTA */}
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => setShowWithdrawModal(true)}
                activeOpacity={0.88}
              >
                <ArrowUpRight size={16} color={BRAND_PURPLE} strokeWidth={2.5} />
                <Text style={styles.withdrawBtnText}>Withdraw to UPI / Bank</Text>
              </TouchableOpacity>
            </View>

            {/* 🛡️ Escrow Security Note */}
            <View style={styles.trustBadgeCard}>
              <ShieldCheck size={18} color="#059669" style={{ marginTop: 1 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.trustTitle}>100% Escrow Protected Payouts</Text>
                <Text style={styles.trustSub}>
                  Student tuition fees are locked in escrow and instantly released to your available balance once sessions conclude.
                </Text>
              </View>
            </View>

            {/* 🏦 Linked Payout Method */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>LINKED PAYOUT METHOD</Text>
            </View>

            <View style={styles.accountCard}>
              <View style={styles.accountIconBox}>
                <QrCode size={18} color={BRAND_PURPLE} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.accountTitle}>Primary UPI Handle</Text>
                <Text style={styles.accountSub}>{upiId} (Instant IMPS Transfer)</Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Primary</Text>
              </View>
            </View>

            {/* 📜 Statement & Transactions History */}
            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>STATEMENT & RECENT TRANSACTIONS ({transactions.length})</Text>
            </View>

            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <View key={tx.id || idx} style={styles.txCard}>
                  <View style={[styles.txIconWrap, tx.type === "debit" ? styles.debitIcon : styles.creditIcon]}>
                    {tx.type === "debit" ? (
                      <ArrowUpRight size={16} color="#EF4444" />
                    ) : (
                      <CheckCircle2 size={16} color="#059669" />
                    )}
                  </View>

                  <View style={{ flex: 1, marginHorizontal: 10 }}>
                    <Text style={styles.txTitle} numberOfLines={1}>{tx.title || "Tuition Session"}</Text>
                    <Text style={styles.txDate}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : "Recent"}</Text>
                  </View>

                  <Text style={[styles.txAmount, tx.type === "debit" ? styles.debitText : styles.creditText]}>
                    {tx.type === "debit" ? `- ₹${tx.amount}` : `+ ₹${tx.amount}`}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No transaction history recorded yet.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 🚀 Instant Withdrawal Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent={true} onRequestClose={() => setShowWithdrawModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalTopRow}>
              <Text style={styles.modalHeading}>Withdraw Payout</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Available balance: <Text style={{ fontWeight: "800", color: BRAND_PURPLE }}>₹{availableBalance.toLocaleString()}</Text>
            </Text>

            {/* Amount Input */}
            <Text style={styles.inputLabel}>AMOUNT TO WITHDRAW (₹) *</Text>
            <View style={styles.amountInputBox}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="500"
                placeholderTextColor="#94A3B8"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Target Account */}
            <Text style={styles.inputLabel}>RECEIVING UPI ADDRESS *</Text>
            <View style={styles.inputBox}>
              <QrCode size={16} color="#94A3B8" />
              <TextInput
                style={styles.input}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="e.g. mobile@upi"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>

            {/* Confirm CTA */}
            <TouchableOpacity
              style={[styles.confirmWithdrawBtn, isProcessing && { opacity: 0.7 }]}
              onPress={handleWithdrawalRequest}
              disabled={isProcessing}
              activeOpacity={0.88}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmWithdrawBtnText}>Initiate Transfer</Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  loaderBox: {
    paddingVertical: 60,
    alignItems: "center"
  },
  loaderText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 12.5,
    fontWeight: "600"
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 90
  },
  mainBalanceCard: {
    backgroundColor: BRAND_PURPLE,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  balanceTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  balanceLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.8
  },
  balanceAmountText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2
  },
  walletIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center"
  },
  balanceDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 14
  },
  metricGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14
  },
  metricItem: {
    flex: 1
  },
  metricItemRight: {
    flex: 1,
    alignItems: "flex-end"
  },
  metricLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600"
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 2
  },
  withdrawBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 12
  },
  withdrawBtnText: {
    color: BRAND_PURPLE,
    fontSize: 13.5,
    fontWeight: "800"
  },
  trustBadgeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)"
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#059669"
  },
  trustSub: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2,
    lineHeight: 15
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 2
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8
  },
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  accountIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center"
  },
  accountTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A"
  },
  accountSub: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1
  },
  activePill: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  activePillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#059669"
  },
  txCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  txIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center"
  },
  creditIcon: {
    backgroundColor: "rgba(16, 185, 129, 0.1)"
  },
  debitIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.1)"
  },
  txTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#0F172A"
  },
  txDate: {
    fontSize: 10.5,
    color: "#94A3B8",
    marginTop: 1
  },
  txAmount: {
    fontSize: 13.5,
    fontWeight: "800"
  },
  creditText: {
    color: "#059669"
  },
  debitText: {
    color: "#EF4444"
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 12,
    fontStyle: "italic"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35
  },
  modalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A"
  },
  modalSub: {
    fontSize: 12.5,
    color: "#64748B",
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginLeft: 2
  },
  amountInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14
  },
  rupeeSymbol: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginRight: 6
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A"
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 18,
    gap: 8
  },
  input: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "600"
  },
  confirmWithdrawBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  confirmWithdrawBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700"
  }
});