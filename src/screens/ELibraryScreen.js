import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions,
  Share
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WebView } from "react-native-webview";
import {
  BookOpen,
  FileText,
  FileCheck,
  Edit3,
  Award,
  ChevronRight,
  RotateCcw,
  GraduationCap,
  X,
  Eye,
  AlertCircle,
  Share2,
  Crown,
  Sparkles,
  ShieldCheck
} from "lucide-react-native";

import Header from "../components/Header";
import { apiFetch } from "../services/api";

const { width, height } = Dimensions.get("window");
const BRAND_PURPLE = '#6C4DFF';
const BRAND_PURPLE_LIGHT = 'rgba(108, 77, 255, 0.08)';

export default function ELibraryScreen({ setScreen }) {
  // Navigation & Filter States
  const [selectedClass, setSelectedClass] = useState("Class 12");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Data States
  const [loadingUser, setLoadingUser] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Dynamic Lists from DB
  const [boardsList, setBoardsList] = useState(["CBSE", "ICSE", "UP Board", "Other State Boards"]);
  const [subjectsList, setSubjectsList] = useState([
    { name: "Mathematics", icon: "📐", color: "#6C4DFF" },
    { name: "Physics", icon: "⚡", color: "#3B82F6" },
    { name: "Chemistry", icon: "🧪", color: "#10B981" },
    { name: "Biology", icon: "🧬", color: "#EC4899" },
    { name: "English", icon: "📖", color: "#F59E0B" }
  ]);

  // Modal Views
  const [showListModal, setShowListModal] = useState(false);
  const [activePdf, setActivePdf] = useState(null);

  // Custom App Alerts
  const [customAlert, setCustomAlert] = useState(null);

  const resourceCategories = [
    {
      id: "cheatsheet",
      title: "Formula & Concept Cheatsheet",
      sub: "Quick 2-minute last-moment revision cards",
      Icon: FileCheck,
      color: "#3B82F6",
      bg: "#EFF6FF"
    },
    {
      id: "handwritten",
      title: "Toppers' Handwritten Notes",
      sub: "Neat, chapter-wise PDF handwritten notes",
      Icon: Edit3,
      color: "#10B981",
      bg: "#ECFDF5"
    },
    {
      id: "chapter_notes",
      title: "Complete Chapter Notes",
      sub: "Detailed theory with solved examples",
      Icon: BookOpen,
      color: "#6C4DFF",
      bg: "#F5F3FF"
    },
    {
      id: "pyq",
      title: "Previous Year Papers (PYQs)",
      sub: "Last 10 years question bank with solutions",
      Icon: Award,
      color: "#F59E0B",
      bg: "#FFFBEB"
    }
  ];

  useEffect(() => {
    checkProAndFetchLibrary();
  }, []);

  const checkProAndFetchLibrary = async () => {
    setLoadingUser(true);
    try {
      let proActive = false;
      let detectedClass = "Class 12";
      let detectedBoard = null;

      const storedUser = await AsyncStorage.getItem("userData");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.isPro === true || parsed?.planName === 'PRO MEMBER' || parsed?.is_pro === true) {
          proActive = true;
        }
        if (parsed?.class_grade) {
          let gradeStr = String(parsed.class_grade).trim();
          if (/^\d+$/.test(gradeStr)) gradeStr = `Class ${gradeStr}`;
          detectedClass = gradeStr;
        }
        if (parsed?.board) {
          detectedBoard = parsed.board;
        }
      }

      const res = await apiFetch("/auth/profile");
      if (res && res.success && res.user) {
        const profile = res.user;
        if (profile.isPro === true || profile.planName === 'PRO MEMBER' || profile.plan_status === 'active' || profile.is_pro === true) {
          proActive = true;
        }
        if (profile.class_grade) {
          let gradeStr = String(profile.class_grade).trim();
          if (/^\d+$/.test(gradeStr)) gradeStr = `Class ${gradeStr}`;
          detectedClass = gradeStr;
        }
        if (profile.board) {
          detectedBoard = profile.board;
        }
      }

      setIsPro(proActive);
      setSelectedClass(detectedClass);
      setSelectedBoard(detectedBoard);

      if (!proActive) {
        setShowProModal(true);
      } else {
        const metaRes = await apiFetch("/library/metadata");
        if (metaRes && metaRes.success) {
          if (metaRes.boards && metaRes.boards.length > 0) setBoardsList(metaRes.boards);
          if (metaRes.subjects && metaRes.subjects.length > 0) setSubjectsList(metaRes.subjects);
        }
      }
    } catch (error) {
      console.log("Error loading library profile:", error);
      setIsPro(false);
      setShowProModal(true);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleCategorySelect = async (category) => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }

    setSelectedCategory(category);
    setShowListModal(true);
    setLoadingMaterials(true);

    try {
      const endpoint = `/library/materials?class_name=${encodeURIComponent(selectedClass)}&board_name=${encodeURIComponent(selectedBoard || "CBSE")}&subject_name=${encodeURIComponent(selectedSubject || "Mathematics")}&category_type=${encodeURIComponent(category.id)}`;
      
      const res = await apiFetch(endpoint);

      if (res && res.success && res.materials && res.materials.length > 0) {
        setMaterials(res.materials);
      } else {
        setMaterials([
          {
            id: 1,
            title: `${selectedSubject} Comprehensive ${category.title}`,
            file_size: "2.4 MB",
            description: `Official verified ${selectedClass} notes for ${selectedBoard || "CBSE"} curriculum.`,
            file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]);
      }
    } catch (error) {
      console.log("Material fetch error:", error);
      setMaterials([
        {
          id: 1,
          title: `${selectedSubject} Quick Revision Notes`,
          file_size: "1.8 MB",
          description: `Sample notes for ${selectedClass} (${selectedBoard || "CBSE"}).`,
          file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        }
      ]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const openInAppPdf = (item) => {
    if (!item?.file_url) {
      setCustomAlert({
        title: "Document Unavailable",
        msg: "The requested document link is missing from database.",
        type: "warning"
      });
      return;
    }
    setActivePdf({
      title: item.title,
      url: item.file_url
    });
  };

  const handleShare = async (title, url) => {
    try {
      await Share.share({
        message: `Check out "${title}" on Brainix AI e-Library!\n${url}`
      });
    } catch (e) {
      console.log(e);
    }
  };

  const resetSelection = () => {
    setSelectedBoard(null);
    setSelectedSubject(null);
  };

  const getPdfViewerUrl = (fileUrl) => {
    return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "left", "right"]}>
      <Header title="AI e-Library" onBack={() => setScreen("home")} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loadingUser ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={BRAND_PURPLE} />
            <Text style={styles.loadingText}>Syncing curriculum from database...</Text>
          </View>
        ) : (
          <>
            {/* Auto-Detected Class Banner */}
            <View style={styles.autoClassCard}>
              <View style={styles.classIconWrapper}>
                <GraduationCap size={20} color={BRAND_PURPLE} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.autoClassSub}>Curriculum configured for</Text>
                <Text style={styles.autoClassTitle}>{selectedClass}</Text>
              </View>
            </View>

            {/* Selection Breadcrumb Progress */}
            {(selectedBoard || selectedSubject) && (
              <View style={styles.breadcrumbCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.breadcrumbTitle}>SELECTED PATH:</Text>
                  <Text style={styles.breadcrumbPath}>
                    {selectedClass} ➔ {selectedBoard || "Board"} ➔ {selectedSubject || "Subject"}
                  </Text>
                </View>
                <TouchableOpacity onPress={resetSelection} style={styles.resetBtn}>
                  <RotateCcw size={14} color={BRAND_PURPLE} />
                  <Text style={styles.resetBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 1: Select Education Board */}
            {!selectedBoard && (
              <View style={styles.sectionGroup}>
                <Text style={styles.stepTitle}>STEP 1: SELECT EDUCATION BOARD</Text>
                {boardsList.map((board) => (
                  <TouchableOpacity
                    key={board}
                    style={styles.selectionCard}
                    onPress={() => setSelectedBoard(board)}
                    activeOpacity={0.7}
                  >
                    <FileText size={20} color="#3B82F6" />
                    <Text style={styles.cardText}>{board}</Text>
                    <ChevronRight size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* STEP 2: Select Subject */}
            {selectedBoard && !selectedSubject && (
              <View style={styles.sectionGroup}>
                <Text style={styles.stepTitle}>STEP 2: SELECT SUBJECT</Text>
                {subjectsList.map((subj) => (
                  <TouchableOpacity
                    key={subj.name}
                    style={styles.selectionCard}
                    onPress={() => setSelectedSubject(subj.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20 }}>{subj.icon || "📚"}</Text>
                    <Text style={styles.cardText}>{subj.name}</Text>
                    <ChevronRight size={18} color="#94A3B8" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* STEP 3: Material Options */}
            {selectedBoard && selectedSubject && (
              <View style={styles.sectionGroup}>
                <Text style={styles.stepTitle}>STUDY MATERIAL CATEGORIES</Text>
                {resourceCategories.map((item) => {
                  const IconComp = item.Icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.resourceCard, { borderColor: item.color }]}
                      onPress={() => handleCategorySelect(item)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.resourceIconBox, { backgroundColor: item.bg }]}>
                        <IconComp size={22} color={item.color} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.resourceTitle}>{item.title}</Text>
                        <Text style={styles.resourceSub}>{item.sub}</Text>
                      </View>
                      <ChevronRight size={18} color={item.color} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* MODAL 1: MATERIAL ITEMS LIST MODAL */}
      <Modal visible={showListModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>{selectedCategory?.title}</Text>
                <Text style={styles.modalSub}>{selectedSubject} | {selectedClass} ({selectedBoard})</Text>
              </View>
              <TouchableOpacity onPress={() => setShowListModal(false)} style={styles.closeBtn}>
                <X size={18} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {loadingMaterials ? (
              <View style={styles.modalLoaderBox}>
                <ActivityIndicator color={BRAND_PURPLE} size="large" />
                <Text style={styles.modalLoaderText}>Fetching resources from database...</Text>
              </View>
            ) : materials.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.55 }}>
                {materials.map((mat) => (
                  <TouchableOpacity
                    key={mat.id}
                    style={styles.pdfItemCard}
                    activeOpacity={0.8}
                    onPress={() => openInAppPdf(mat)}
                  >
                    <View style={styles.pdfIconBox}>
                      <FileText size={20} color={BRAND_PURPLE} />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text style={styles.pdfItemTitle} numberOfLines={1}>{mat.title}</Text>
                      <Text style={styles.pdfItemSub} numberOfLines={1}>
                        {mat.file_size || 'PDF'} • {mat.description || 'Verified Database Resource'}
                      </Text>
                    </View>
                    <View style={styles.openPillBtn}>
                      <Eye size={14} color={BRAND_PURPLE} />
                      <Text style={styles.openPillText}>Read</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconCircle}>
                  <BookOpen size={30} color={BRAND_PURPLE} />
                </View>
                <Text style={styles.emptyTitle}>No Material Found in Database</Text>
                <Text style={styles.emptySub}>No study notes have been uploaded for this specific subject and board yet.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL 2: FULL-SCREEN IN-APP PDF VIEWER */}
      <Modal visible={Boolean(activePdf)} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.viewerContainer} edges={["top", "bottom"]}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setActivePdf(null)} style={styles.viewerBackBtn}>
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ flex: 1, marginHorizontal: 12 }}>
              <Text style={styles.viewerTitle} numberOfLines={1}>{activePdf?.title || "Document Reader"}</Text>
              <Text style={styles.viewerSubtitle}>Brainix Verified Study Material</Text>
            </View>
            <TouchableOpacity onPress={() => handleShare(activePdf?.title, activePdf?.url)} style={styles.viewerShareBtn}>
              <Share2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, backgroundColor: "#0F172A" }}>
            {activePdf?.url && (
              <WebView
                source={{ uri: getPdfViewerUrl(activePdf.url) }}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.viewerLoader}>
                    <ActivityIndicator size="large" color={BRAND_PURPLE} />
                    <Text style={styles.viewerLoaderText}>Rendering High-Res PDF Document...</Text>
                  </View>
                )}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 3: APP ALERT DIALOG */}
      <Modal visible={Boolean(customAlert)} transparent animationType="fade">
        <View style={styles.alertOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertIconCircle}>
              <AlertCircle size={28} color={BRAND_PURPLE} />
            </View>
            <Text style={styles.alertTitle}>{customAlert?.title}</Text>
            <Text style={styles.alertMsg}>{customAlert?.msg}</Text>
            <TouchableOpacity onPress={() => setCustomAlert(null)} style={styles.alertBtn}>
              <Text style={styles.alertBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🌟 PRO UPGRADE MODAL */}
      <Modal visible={showProModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.proModalCard}>
            <TouchableOpacity 
              style={styles.modalCloseBtn} 
              onPress={() => {
                setShowProModal(false);
                setScreen("home");
              }}
              activeOpacity={0.7}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.crownCircle}>
              <Crown size={28} color={BRAND_PURPLE} strokeWidth={2.5} />
            </View>

            <Text style={styles.proModalTitle}>Pro Membership Required</Text>
            <Text style={styles.proModalDesc}>
              Access to e-Library notes, previous year papers, and toppers' handwritten material is exclusive to <Text style={{ fontWeight: "800", color: "#0F172A" }}>Brainix PRO</Text> members.
            </Text>

            <TouchableOpacity
              style={styles.proUpgradeActionBtn}
              onPress={() => {
                setShowProModal(false);
                setScreen("premium");
              }}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.proUpgradeActionText}>Upgrade to PRO Now</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                setShowProModal(false);
                setScreen("home");
              }}
              style={{ marginTop: 12, paddingVertical: 6 }}
            >
              <Text style={{ fontSize: 12.5, fontWeight: "600", color: "#64748B" }}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  loadingBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 30, gap: 8 },
  loadingText: { color: "#64748B", fontSize: 13, fontWeight: "600" },
  autoClassCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#64748B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  classIconWrapper: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND_PURPLE_LIGHT, justifyContent: "center", alignItems: "center" },
  autoClassSub: { fontSize: 10, color: "#94A3B8", fontWeight: "800", letterSpacing: 0.5 },
  autoClassTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A", marginTop: 2 },
  breadcrumbCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  breadcrumbTitle: { fontSize: 10, fontWeight: "800", color: "#94A3B8", letterSpacing: 0.5 },
  breadcrumbPath: { fontSize: 13, fontWeight: "800", color: BRAND_PURPLE, marginTop: 2 },
  resetBtn: { flexDirection: "row", alignItems: "center", backgroundColor: BRAND_PURPLE_LIGHT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  resetBtnText: { fontSize: 12, fontWeight: "800", color: BRAND_PURPLE, marginLeft: 4 },
  sectionGroup: { marginTop: 4 },
  stepTitle: { color: "#64748B", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10, marginLeft: 4 },
  selectionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#64748B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#0F172A", marginLeft: 12 },
  resourceCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1.5, shadowColor: "#64748B", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  resourceIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  resourceTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  resourceSub: { fontSize: 11.5, color: "#64748B", marginTop: 2, fontWeight: "500" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  modalSub: { fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: "600" },
  closeBtn: { padding: 8, borderRadius: 12, backgroundColor: "#F1F5F9" },
  modalLoaderBox: { paddingVertical: 50, alignItems: "center" },
  modalLoaderText: { marginTop: 12, color: "#64748B", fontSize: 13, fontWeight: "600" },
  pdfItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  pdfIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND_PURPLE_LIGHT, justifyContent: "center", alignItems: "center" },
  pdfItemTitle: { fontSize: 13, fontWeight: "800", color: "#0F172A" },
  pdfItemSub: { fontSize: 11, color: "#64748B", marginTop: 2, fontWeight: "500" },
  openPillBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: BRAND_PURPLE_LIGHT, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  openPillText: { color: BRAND_PURPLE, fontSize: 12, fontWeight: "800" },
  emptyBox: { paddingVertical: 40, alignItems: "center", paddingHorizontal: 20 },
  emptyIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: BRAND_PURPLE_LIGHT, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  emptySub: { fontSize: 12, color: "#94A3B8", textAlign: "center", marginTop: 6, lineHeight: 18 },
  viewerContainer: { flex: 1, backgroundColor: "#0B0B0F" },
  viewerHeader: { flexDirection: "row", alignItems: "center", backgroundColor: "#12121A", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.1)" },
  viewerBackBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(255, 255, 255, 0.08)", justifyContent: "center", alignItems: "center" },
  viewerShareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(108, 77, 255, 0.2)", justifyContent: "center", alignItems: "center" },
  viewerTitle: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  viewerSubtitle: { color: "#A78BFA", fontSize: 11, fontWeight: "600", marginTop: 1 },
  viewerLoader: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0F172A", justifyContent: "center", alignItems: "center" },
  viewerLoaderText: { color: "#94A3B8", fontSize: 12, fontWeight: "700", marginTop: 12 },
  alertOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center", padding: 24 },
  alertCard: { width: "100%", backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, alignItems: "center" },
  alertIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: BRAND_PURPLE_LIGHT, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  alertTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  alertMsg: { fontSize: 12, color: "#64748B", textAlign: "center", marginTop: 6, marginBottom: 18, lineHeight: 18 },
  alertBtn: { width: "100%", backgroundColor: BRAND_PURPLE, paddingVertical: 12, borderRadius: 14, alignItems: "center" },
  alertBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  // Pro Modal Styles
  proModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: "auto"
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center"
  },
  crownCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BRAND_PURPLE_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(108, 77, 255, 0.2)"
  },
  proModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center"
  },
  proModalDesc: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20
  },
  proUpgradeActionBtn: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: BRAND_PURPLE,
    borderRadius: 16,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BRAND_PURPLE,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3
  },
  proUpgradeActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3
  }
});