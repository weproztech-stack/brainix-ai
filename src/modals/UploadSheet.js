import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  Camera,
  Image as ImageIcon,
  FileText,
  FileType,
  ChevronRight,
  X
} from "lucide-react-native";

import colors from "../constants/colors";
import { styles as globalStyles } from "../styles/styles";

export default function UploadSheet({ onClose, onSelectMedia }) {

  // 1. Camera Click Handler
  const handleCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Camera permission is required to capture question photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        const formattedBase64 = asset.base64 
          ? (asset.base64.startsWith("data:") ? asset.base64 : `data:image/jpeg;base64,${asset.base64}`)
          : null;

        if (onSelectMedia) {
          onSelectMedia({
            type: "image",
            uri: asset.uri,
            base64: formattedBase64,
            fileName: asset.fileName || "camera_photo.jpg"
          });
        }
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open camera: " + error.message);
    }
  };

  // 2. Gallery Click Handler
  const handleGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Gallery access permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        const formattedBase64 = asset.base64 
          ? (asset.base64.startsWith("data:") ? asset.base64 : `data:image/jpeg;base64,${asset.base64}`)
          : null;

        if (onSelectMedia) {
          onSelectMedia({
            type: "image",
            uri: asset.uri,
            base64: formattedBase64,
            fileName: asset.fileName || "gallery_image.jpg"
          });
        }
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  // 3. Document / PDF Picker Handler
  const handleDocument = async (docType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: docType === "pdf" ? "application/pdf" : "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const doc = result.assets[0];
        if (onSelectMedia) {
          onSelectMedia({
            type: "document",
            uri: doc.uri,
            name: doc.name || "Document"
          });
        }
        onClose();
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document: " + error.message);
    }
  };

  const handlePress = (key) => {
    switch (key) {
      case "cam":
        handleCamera();
        break;
      case "img":
        handleGallery();
        break;
      case "pdf":
        handleDocument("pdf");
        break;
      case "doc":
        handleDocument("all");
        break;
      default:
        break;
    }
  };

  const items = [
    { key: "cam", Icon: Camera, title: "Take Photo", sub: "Use camera to capture question", color: colors.purple || "#6C4DFF", bg: "#EEF2FF" },
    { key: "img", Icon: ImageIcon, title: "Choose from Gallery", sub: "Select image from your gallery", color: colors.blue || "#3B82F6", bg: "#EFF6FF" },
    { key: "pdf", Icon: FileText, title: "Upload PDF", sub: "Upload question from PDF file", color: colors.green || "#10B981", bg: "#ECFDF5" },
    { key: "doc", Icon: FileType, title: "Upload Document", sub: "Upload question from document", color: "#F59E0B", bg: "#FFFBEB" }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={localStyles.overlay}>
        <TouchableOpacity
          style={localStyles.overlayFill}
          onPress={onClose}
          activeOpacity={1}
        />

        <View style={localStyles.sheet}>
          <View style={localStyles.sheetHandle} />

          <Text style={localStyles.sheetTitle}>
            Upload Question
          </Text>

          <Text style={localStyles.sheetBody}>
            Choose an option to upload your question
          </Text>

          {items.map(({ key, Icon, title, sub, color, bg }) => (
            <TouchableOpacity
              style={localStyles.uploadRow}
              key={key}
              onPress={() => handlePress(key)}
              activeOpacity={0.7}
            >
              <View style={[localStyles.iconBox, { backgroundColor: bg }]}>
                <Icon size={20} color={color} strokeWidth={2} />
              </View>

              <View style={localStyles.questionText}>
                <Text style={localStyles.uploadTitle}>
                  {title}
                </Text>

                <Text style={localStyles.questionMeta}>
                  {sub}
                </Text>
              </View>

              <ChevronRight size={18} color="#94A3B8" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={localStyles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <X size={16} color="#64748B" style={{ marginRight: 6 }} />
            <Text style={localStyles.cancelText}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  overlayFill: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  sheetBody: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    marginBottom: 16,
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  questionText: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  questionMeta: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
});