import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  StyleSheet,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Crown, CheckCircle2, ShieldCheck, Tag, X, CheckCircle, AlertCircle, Sparkles, BookOpen, Mic, Brain } from "lucide-react-native";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const BRAND_PURPLE = "#6C4DFF";
const BRAND_PURPLE_LIGHT = "rgba(108, 77, 255, 0.08)";
const BRAND_PURPLE_BORDER = "rgba(108, 77, 255, 0.25)";

export default function PremiumScreen({ setScreen }) {
  // Updated Real Subscription Plans with New Pricing
  const plans = [
    {
      id: 1,
      name: "6 Months Access",
      subtitle: "Billed semi-annually • Ideal for semester prep",
      price: 4700,
      oldPrice: 7500,
      tag: "Popular",
      saveText: "Save ₹2,800"
    },
    {
      id: 2,
      name: "12 Months Access",
      subtitle: "Billed annually • Complete Academic Year Mastery",
      price: 6000,
      oldPrice: 12000,
      tag: "Best Value",
      saveText: "Save ₹6,000"
    }
  ];

  const [selectedPlanId, setSelectedPlanId] = useState(2); // Default 1 Year

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Cashfree Modal & Session States
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProduction, setIsProduction] = useState(true);

  // Branded Popup Modal States
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'success' });

  const showAlert = (title, message, type = 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];

  // Clean, Merged & Categorized Pro Benefits
  const proCategories = [
    {
      title: "AI & Socratic Solving",
      icon: <Brain size={16} color={BRAND_PURPLE} />,
      items: [
        "Unlimited AI Question Solving & Detailed Proofs",
        "Step-by-Step Explanations (Method, Logic & Concept)",
        "High-Resolution Image & Formula Scanner Analysis",
        "AI Voice Tutor for Natural Audio Conversations"
      ]
    },
    {
      title: "Study Bank & Notes",
      icon: <BookOpen size={16} color={BRAND_PURPLE} />,
      items: [
        "Complete Chapter Notes & Topper-Style Handwritten Notes",
        "Previous Year Papers (PYQs) & Last 10 Years Bank",
        "Formula & Concept Quick Revision Cheatsheets",
        "AI E-Library & Curriculum-Grounded Resources (CBSE, ICSE, State)"
      ]
    },
    {
      title: "Advanced Learning",
      icon: <Sparkles size={16} color={BRAND_PURPLE} />,
      items: [
        "Adaptive Practice & Learning Gap Detection",
        "Personalized Revision Plans & Performance Insights",
        "100% Ad-Free Priority AI Engine with 24/7 Access",
        "Multilingual AI Support & Smart Recommendations"
      ]
    }
  ];

  // 1. Apply Coupon Logic
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert("Error", "Please enter a valid coupon code.", "error");
      return;
    }

    setCouponLoading(true);
    try {
      const data = await apiFetch("/payment/apply-coupon", {
        method: "POST",
        body: JSON.stringify({
          coupon_code: couponCode.trim(),
          plan_amount: selectedPlan.price
        })
      });

      if (data && data.success) {
        setAppliedCoupon(data);
        showAlert("🎉 Coupon Applied!", `Discount: ₹${data.discount_amount} | Payable: ₹${data.final_price}`, "success");
      } else {
        setAppliedCoupon(null);
        showAlert("Coupon Notice", data?.message || "Invalid or expired code.", "error");
      }
    } catch (err) {
      showAlert("Error", "Could not validate coupon with server.", "error");
    } finally {
      setCouponLoading(false);
    }
  };

  // 2. Remove Applied Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  // 3. Initiate Cashfree Real Payment Gateway
  const handleProceedToPayment = async () => {
    setPaymentLoading(true);

    try {
      const orderRes = await apiFetch("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          plan_amount: selectedPlan.price,
          coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null
        })
      });

      if (!orderRes || !orderRes.success || !orderRes.payment_session_id) {
        setPaymentLoading(false);
        showAlert("Gateway Notice", orderRes?.message || "Failed to initialize gateway.", "error");
        return;
      }

      setPaymentSessionId(orderRes.payment_session_id);
      setCurrentOrderId(orderRes.order_id);
      setIsProduction(orderRes.environment === "PRODUCTION");
      setShowPaymentModal(true);
      setPaymentLoading(false);

    } catch (error) {
      setPaymentLoading(false);
      showAlert("Gateway Error", error.message || "Unable to load checkout.", "error");
    }
  };

  // 4. Verify Payment on Backend
  const verifyAndActivatePlan = async (orderId) => {
    setShowPaymentModal(false);
    setPaymentLoading(true);

    try {
      const verifyRes = await apiFetch("/payment/verify-payment", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          plan_id: selectedPlan.id,
          coupon_id: appliedCoupon ? appliedCoupon.coupon_id : null
        })
      });

      setPaymentLoading(false);

      if (verifyRes && verifyRes.success) {
        showAlert(
          "🎉 Pro Activated!",
          "Congratulations! Unlimited AI access is now unlocked across your account."
        );
      } else {
        showAlert("Status", verifyRes?.message || "Payment status not confirmed yet.", "error");
      }
    } catch (e) {
      setPaymentLoading(false);
      showAlert("Notice", "Verification request complete.");
    }
  };

  const handleWebViewNavigation = (navState) => {
    const { url } = navState;
    if (url.includes("verify-cashfree") || url.includes("return_url") || url.includes("status=success")) {
      verifyAndActivatePlan(currentOrderId);
    }
  };

  const currentPayable = appliedCoupon ? appliedCoupon.final_price : selectedPlan.price;

  const cashfreeCheckoutHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
        <style>
          body { margin: 0; background: #0B0B0F; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; color: #FFF; }
          .loader { font-size: 15px; font-weight: bold; color: #6C4DFF; }
        </style>
      </head>
      <body>
        <div class="loader">Connecting to Cashfree...</div>
        <script>
          const cashfree = Cashfree({
            mode: "${isProduction ? "production" : "sandbox"}"
          });
          cashfree.checkout({
            paymentSessionId: "${paymentSessionId}",
            redirectTarget: "_self"
          });
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Header title="Upgrade Pro" onBack={() => setScreen("home")} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Minimal Hero Header */}
        <View style={styles.heroSection}>
          <View style={styles.crownIconBox}>
            <Crown size={22} color={BRAND_PURPLE} strokeWidth={2.2} />
          </View>
          <Text style={styles.heroTitle}>Upgrade to Brainix Pro</Text>
          <Text style={styles.heroSubtitle}>
            More than an upgrade — your complete AI-powered study companion. Ask More • Understand Better • Practice Smarter.
          </Text>
        </View>

        {/* Categorized Clean Feature List */}
        {proCategories.map((cat, idx) => (
          <View key={idx} style={styles.featureCard}>
            <View style={styles.categoryTitleRow}>
              {cat.icon}
              <Text style={styles.featuresHeader}>{cat.title.toUpperCase()}</Text>
            </View>
            {cat.items.map((item, itemIdx) => (
              <View key={itemIdx} style={styles.featureRow}>
                <CheckCircle2 size={15} color={BRAND_PURPLE} strokeWidth={2.2} />
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Section Label */}
        <Text style={styles.sectionHeading}>SELECT MEMBERSHIP PLAN</Text>

        {/* Minimal Plan Cards */}
        {plans.map((p) => {
          const isSelected = selectedPlanId === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.planCard,
                isSelected ? styles.planCardSelected : styles.planCardUnselected
              ]}
              onPress={() => {
                setSelectedPlanId(p.id);
                setAppliedCoupon(null);
              }}
              activeOpacity={0.88}
            >
              {/* Radio Indicator */}
              <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>

              {/* Plan Info */}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.titleRow}>
                  <Text style={[styles.planTitle, isSelected && { color: "#0F172A" }]}>{p.name}</Text>
                  <View style={[styles.badge, isSelected ? styles.badgeActive : styles.badgeInactive]}>
                    <Text style={[styles.badgeText, isSelected ? styles.badgeTextActive : styles.badgeTextInactive]}>
                      {p.tag}
                    </Text>
                  </View>
                </View>
                <Text style={styles.planSub}>{p.subtitle}</Text>
              </View>

              {/* Pricing */}
              <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
                <Text style={[styles.planPrice, isSelected && { color: BRAND_PURPLE }]}>₹{p.price}</Text>
                <Text style={styles.oldPrice}>₹{p.oldPrice}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Minimal Coupon Section */}
        <View style={styles.couponContainer}>
          <View style={styles.couponBox}>
            <Tag size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
            <TextInput
              style={styles.couponInput}
              placeholder="Promo or Coupon Code"
              placeholderTextColor="#94A3B8"
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
              editable={!appliedCoupon}
            />
            {appliedCoupon ? (
              <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveCoupon}>
                <X size={14} color="#EF4444" />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApplyCoupon}
                disabled={couponLoading}
                activeOpacity={0.8}
              >
                {couponLoading ? (
                  <ActivityIndicator color={BRAND_PURPLE} size="small" />
                ) : (
                  <Text style={styles.applyBtnText}>Apply</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Applied Coupon Info Box */}
        {appliedCoupon && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              ✓ Code <Text style={{ fontWeight: "800" }}>{appliedCoupon.coupon_code}</Text> applied (Saved ₹{appliedCoupon.discount_amount})
            </Text>
          </View>
        )}

        {/* Main CTA Button */}
        <TouchableOpacity
          style={[styles.payButton, paymentLoading && { opacity: 0.7 }]}
          onPress={handleProceedToPayment}
          disabled={paymentLoading}
          activeOpacity={0.88}
        >
          {paymentLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay ₹{currentPayable} & Unlock Pro
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerNoteRow}>
          <ShieldCheck size={13} color="#94A3B8" />
          <Text style={styles.footerNote}>
            Secured via Cashfree • Instant Activation
          </Text>
        </View>
      </ScrollView>

      {/* Professional Branded Popup Modal */}
      <Modal transparent visible={alertVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.iconCircle, { backgroundColor: alertConfig.type === 'error' ? '#FEF2F2' : '#ECFDF5' }]}>
              {alertConfig.type === 'error' ? (
                <AlertCircle size={30} color="#EF4444" />
              ) : (
                <CheckCircle size={30} color="#059669" />
              )}
            </View>
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalMessage}>{alertConfig.message}</Text>
            <TouchableOpacity 
              style={styles.modalBtn} 
              onPress={() => {
                setAlertVisible(false);
                if (alertConfig.title.includes("Pro Activated")) {
                  setScreen("home");
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cashfree Checkout WebView Modal */}
      <Modal visible={showPaymentModal} animationType="slide" onRequestClose={() => setShowPaymentModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0B0F" }}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Cashfree Checkout</Text>
            <TouchableOpacity onPress={() => verifyAndActivatePlan(currentOrderId)} style={styles.closeModalBtn}>
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 12 }}>Close</Text>
            </TouchableOpacity>
          </View>
          {paymentSessionId && (
            <WebView
              source={{ html: cashfreeCheckoutHtml }}
              onNavigationStateChange={handleWebViewNavigation}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              renderLoading={() => (
                <ActivityIndicator size="large" color={BRAND_PURPLE} style={{ position: "absolute", top: "50%", left: "45%" }} />
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 90
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4
  },
  crownIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER
  },
  heroTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4
  },
  heroSubtitle: {
    color: "#64748B",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 12
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1
  },
  categoryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10
  },
  featuresHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: BRAND_PURPLE,
    letterSpacing: 0.8
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    gap: 8
  },
  featureText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    lineHeight: 17
  },
  sectionHeading: {
    color: "#94A3B8",
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
    marginTop: 4
  },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1.5
  },
  planCardSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: BRAND_PURPLE,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  planCardUnselected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0"
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center"
  },
  radioCircleActive: {
    borderColor: BRAND_PURPLE
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BRAND_PURPLE
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  planTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#334155"
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  badgeActive: {
    backgroundColor: BRAND_PURPLE_LIGHT
  },
  badgeInactive: {
    backgroundColor: "#F1F5F9"
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: "700"
  },
  badgeTextActive: {
    color: BRAND_PURPLE
  },
  badgeTextInactive: {
    color: "#64748B"
  },
  planSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500"
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A"
  },
  oldPrice: {
    fontSize: 11,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "600"
  },
  couponContainer: {
    marginTop: 4,
    marginBottom: 6
  },
  couponBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 48
  },
  couponInput: {
    flex: 1,
    color: "#0F172A",
    fontSize: 13,
    paddingHorizontal: 8,
    fontWeight: "600"
  },
  applyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BRAND_PURPLE_LIGHT
  },
  applyBtnText: {
    color: BRAND_PURPLE,
    fontWeight: "700",
    fontSize: 12
  },
  removeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4
  },
  removeBtnText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 11.5
  },
  discountBadge: {
    backgroundColor: BRAND_PURPLE_LIGHT,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND_PURPLE_BORDER
  },
  discountText: {
    color: BRAND_PURPLE,
    fontSize: 11.5,
    fontWeight: "600",
    textAlign: "center"
  },
  payButton: {
    backgroundColor: BRAND_PURPLE,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
    shadowColor: BRAND_PURPLE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  footerNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 2
  },
  footerNote: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500"
  },
  webViewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)"
  },
  webViewTitle: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14
  },
  closeModalBtn: {
    backgroundColor: BRAND_PURPLE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalBtn: {
    width: '100%',
    backgroundColor: BRAND_PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  }
});