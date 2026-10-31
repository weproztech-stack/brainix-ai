import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Plus, SendHorizontal, Mic, Square } from "lucide-react-native";

import homeStyles from "../styles/homeStyles";

export default function Composer({
  inputRef,
  placeholder = "Ask any question...",
  value,
  onChangeText,
  onUpload,
  onVoice,
  onMicPress,
  onSend,
  isRecording = false,
  isTranscribing = false
}) {
  const hasText = value && value.trim().length > 0;
  const handleMicAction = onVoice || onMicPress;

  return (
    <View style={[homeStyles.composer, isRecording && { borderColor: "#EF4444", backgroundColor: "#FEF2F2" }]}>
      {/* Vector (+) Button for Upload / Camera / Gallery */}
      <TouchableOpacity
        style={homeStyles.plus}
        onPress={() => {
          if (onUpload) onUpload();
        }}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Plus size={20} color="#6C4DFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Input Field */}
      <TextInput
        ref={inputRef}
        style={[homeStyles.composerInput, { flex: 1 }]}
        placeholder={isRecording ? "Listening to your voice..." : placeholder}
        placeholderTextColor={isRecording ? "#EF4444" : "#9CA3AF"}
        value={value}
        onChangeText={onChangeText}
        multiline={false}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />

      {/* Dynamic Action: Send (when typing) OR Active Mic/Processing (when empty) */}
      {hasText ? (
        <TouchableOpacity
          style={homeStyles.send}
          onPress={() => {
            if (onSend) onSend();
          }}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <SendHorizontal size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            homeStyles.plus,
            isRecording && { backgroundColor: "#EF4444", borderRadius: 20 }
          ]}
          onPress={() => {
            if (handleMicAction) handleMicAction();
          }}
          disabled={isTranscribing}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isTranscribing ? (
            <ActivityIndicator size="small" color="#6C4DFF" />
          ) : isRecording ? (
            <Square size={16} color="#FFFFFF" fill="#FFFFFF" />
          ) : (
            <Mic size={20} color="#6C4DFF" strokeWidth={2} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}