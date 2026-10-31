export default function subtitle(item) {
  return {
    Profile: "View and edit your profile",
    "Study Preferences": "Subjects, classes and more",
    Language: "Choose your preferred language",
    Appearance: "Choose theme and color mode",
    Notifications: "Manage push notifications",
    "Privacy & Security": "Manage your data and privacy",
    "Clear Chat History": "Remove all your chat history",
    "Download Settings": "PDF quality, auto-download",
    "Storage Usage": "Manage app storage",
    "Help & Support": "Get help and contact us",
    "Rate Us": "If you enjoy using Brainory AI",
    About: "App version and information",
    "Personal Information": "Edit your name, email and contact",
    "Change Password": "Update your password",
    "Account Security": "Manage login and security",
    "Subjects of Interest": "Manage your favorite subjects",
    "Class / Grade": "Update your class or grade",
    "Learning Goal": "Tell us what you want to achieve",
    "Export My Data": "Download your data and history",
    "Delete Account": "Permanently delete your account"
  }[item] || "";
}