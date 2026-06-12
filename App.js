import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const colors = {
  bg: "#F7F7FF",
  white: "#FFFFFF",
  ink: "#06143A",
  muted: "#657094",
  soft: "#F0ECFF",
  softBlue: "#EEF5FF",
  line: "#E6E8F5",
  purple: "#6847F5",
  purple2: "#4C2EE8",
  blue: "#2B78F6",
  green: "#41BF83",
  orange: "#FF8B3D",
  red: "#FF4B45"
};

const questions = [
  { icon: "sqrt", title: "Solve: x^2 + 5x + 6 = 0", meta: "Algebra  -  Quadratic Equation", time: "10:30 AM", color: colors.purple },
  { icon: "bio", title: "Explain Photosynthesis process", meta: "Biology  -  Class 10", time: "09:15 AM", color: colors.green },
  { icon: "phy", title: "Find force between two charges", meta: "Physics  -  Electrostatics", time: "08:45 AM", color: colors.orange }
];

const historyGroups = [
  { label: "Today", date: "May 21, 2024", items: questions },
  {
    label: "Yesterday",
    date: "May 20, 2024",
    items: [
      { icon: "cube", title: "What is Covalent Bond?", meta: "Chemistry  -  Class 10", time: "07:30 PM", color: colors.purple },
      { icon: "int", title: "Evaluate integral x^2 dx", meta: "Math  -  Calculus", time: "06:20 PM", color: colors.blue }
    ]
  },
  {
    label: "May 19, 2024",
    date: "",
    items: [
      { icon: "book", title: "Newton's First Law of Motion", meta: "Physics  -  Motion", time: "09:40 PM", color: "#F6B83F" },
      { icon: "chem", title: "Balance the equation: H2 + O2 -> H2O", meta: "Chemistry  -  Reactions", time: "08:10 PM", color: colors.green }
    ]
  },
  {
    label: "May 18, 2024",
    date: "",
    items: [
      { icon: "dna", title: "Structure of DNA", meta: "Biology  -  Genetics", time: "07:50 PM", color: colors.purple }
    ]
  }
];

function Brand({ large }) {
  return (
    <View style={styles.brand}>
      <Text style={[styles.brandText, large && styles.brandTextLarge]}>Brainory </Text>
      <Text style={[styles.brandAi, large && styles.brandTextLarge]}>AI</Text>
      <Text style={styles.spark}>++</Text>
    </View>
  );
}

function IconBubble({ label, color = colors.purple, size = 54 }) {
  return (
    <View style={[styles.iconBubble, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: tint(color) }]}>
      <Text style={[styles.iconLabel, { color, fontSize: size > 70 ? 18 : 12 }]}>{label}</Text>
    </View>
  );
}

function tint(color) {
  if (color === colors.green) return "#E5F8EF";
  if (color === colors.orange) return "#FFF0E7";
  if (color === colors.blue) return "#E9F1FF";
  if (color === colors.red) return "#FFECEC";
  return colors.soft;
}

function Robot({ size = 132 }) {
  return (
    <View style={[styles.robot, { width: size, height: size }]}>
      <View style={[styles.robotGlow, { width: size, height: size, borderRadius: size / 2 }]} />
      <View style={[styles.robotHead, { width: size * 0.66, height: size * 0.54 }]}>
        <View style={styles.robotFace}>
          <View style={styles.robotEye} />
          <View style={styles.robotEye} />
        </View>
      </View>
      <View style={styles.robotAntenna} />
    </View>
  );
}

function PhoneStatus() {
  return (
    <View style={styles.phoneStatus}>
      <Text style={styles.time}>9:41</Text>
      <Text style={styles.statusIcons}>||| wifi bat</Text>
    </View>
  );
}

function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <SafeAreaView style={styles.splash}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.splashDecorOne} />
      <View style={styles.splashDecorTwo} />
      <Robot size={138} />
      <Brand large />
      <Text style={styles.splashSub}>Your Smart Study Companion</Text>
      <View style={styles.splashTip}>
        <IconBubble label="cap" size={38} />
        <Text style={styles.splashTipText}>Solve any question.{"\n"}Learn better. Achieve more.</Text>
      </View>
      <View style={styles.loadingTrack}><View style={styles.loadingFill} /></View>
      <Text style={styles.loadingText}>Loading...</Text>
    </SafeAreaView>
  );
}

const onboarding = [
  {
    titleA: "Snap",
    titleB: " Any Question",
    body: "Take a photo of any question\nand let AI understand it instantly.",
    art: "scan"
  },
  {
    titleA: "Get ",
    titleB: "Step-by-Step\nSolutions",
    body: "Receive detailed, easy to understand\nsolutions powered by AI.",
    art: "solution"
  },
  {
    titleA: "Your ",
    titleB: "Smart Study\nHistory",
    body: "All your questions are saved\nand organised date-wise.",
    art: "history"
  }
];

function OnboardingScreen({ onDone }) {
  const [index, setIndex] = useState(0);
  const slide = onboarding[index];
  const next = () => (index === onboarding.length - 1 ? onDone() : setIndex(index + 1));

  return (
    <SafeAreaView style={styles.onboardSafe}>
      <PhoneStatus />
      <TouchableOpacity style={styles.skip} onPress={onDone}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <View style={styles.onboardArt}>
        {slide.art === "scan" && <ScanArt />}
        {slide.art === "solution" && <SolutionArt />}
        {slide.art === "history" && <HistoryArt />}
      </View>
      <Text style={styles.onboardTitle}>
        <Text style={styles.onboardAccent}>{slide.titleA}</Text>
        {slide.titleB}
      </Text>
      <Text style={styles.onboardBody}>{slide.body}</Text>
      <View style={styles.dots}>
        {onboarding.map((_, i) => <View key={i} style={[styles.dot, i === index && styles.dotActive]} />)}
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={next}>
        <Text style={styles.nextText}>{index === 2 ? "Get Started" : "Next"}</Text>
        <Text style={styles.nextArrow}>-></Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function ScanArt() {
  return (
    <View style={styles.artBlob}>
      <View style={styles.paper}>
        <Text style={styles.formula}>x^2 + y^2 = z^2</Text>
        <View style={styles.lineLong} />
        <View style={styles.lineShort} />
        <View style={styles.triangle} />
      </View>
      <View style={styles.cameraBadge}><Text style={styles.cameraText}>cam</Text></View>
    </View>
  );
}

function SolutionArt() {
  return (
    <View style={styles.artBlob}>
      <View style={styles.chatTop}><Text style={styles.chatTopText}>Explain Newton's{"\n"}Second Law</Text></View>
      <View style={styles.solutionCardMini}>
        <Robot size={54} />
        <View style={styles.lineLong} />
        <View style={styles.lineShort} />
        <Text style={styles.formulaPill}>F = ma</Text>
        <View style={styles.lineLong} />
      </View>
    </View>
  );
}

function HistoryArt() {
  return (
    <View style={styles.artBlob}>
      <View style={styles.historyMini}>
        <View style={styles.historyMiniHead}>
          <Text style={styles.historyMiniTitle}>History</Text>
          <IconBubble label="cal" size={28} />
        </View>
        {questions.map((q) => (
          <View style={styles.historyMiniRow} key={q.title}>
            <IconBubble label={q.icon} size={30} color={q.color} />
            <View style={{ flex: 1 }}>
              <Text style={styles.historyMiniQuestion}>{q.title.split(" ").slice(0, 2).join(" ")}</Text>
              <View style={styles.miniLine} />
            </View>
            <Text style={styles.miniTime}>{q.time}</Text>
          </View>
        ))}
      </View>
      <View style={styles.clockBadge}><Text style={styles.clockText}>hist</Text></View>
    </View>
  );
}

function Header({ title, onMenu, onBack, right = "pro" }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.square} onPress={onBack || onMenu}>
        <Text style={styles.squareText}>{onBack ? "<" : "☰"}</Text>
      </TouchableOpacity>
      {title ? <Text style={styles.headerTitle}>{title}</Text> : <Brand />}
      {right === "trash" ? (
        <TouchableOpacity style={styles.square}><Text style={[styles.squareText, { color: colors.purple }]}>del</Text></TouchableOpacity>
      ) : right === "restore" ? (
        <Text style={styles.restore}>Restore</Text>
      ) : (
        <TouchableOpacity style={styles.pro}><Text style={styles.proText}>Pro</Text></TouchableOpacity>
      )}
    </View>
  );
}

function HomeScreen({ setScreen }) {
  const [upload, setUpload] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Header onMenu={() => setDrawer(true)} />
        <View style={styles.heroCard}>
          <Robot />
          <Text style={styles.heroTitle}>Hi, Student!</Text>
          <Text style={styles.heroSub}>Ask any question in any way,{"\n"}and get instant AI solutions.</Text>
          <View style={styles.homeActions}>
            <FeatureButton icon="cam" title="Upload Image" sub="Snap or upload question image" color={colors.purple} onPress={() => setUpload(true)} />
            <FeatureButton icon="key" title="Type Question" sub="Type or paste your question text" color={colors.blue} onPress={() => setScreen("solution")} />
          </View>
        </View>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Questions</Text>
          <TouchableOpacity onPress={() => setScreen("history")}><Text style={styles.link}>See All</Text></TouchableOpacity>
        </View>
        {questions.map((q) => <QuestionRow key={q.title} item={q} onPress={() => setScreen("solution")} />)}
        <Text style={styles.safeHistory}>Your history is saved and secure</Text>
      </ScrollView>
      <Composer onUpload={() => setUpload(true)} onSend={() => setScreen("solution")} placeholder="Ask anything..." />
      {upload && <UploadSheet onClose={() => setUpload(false)} />}
      {drawer && <SideDrawer setScreen={setScreen} onClose={() => setDrawer(false)} />}
    </SafeAreaView>
  );
}

function FeatureButton({ icon, title, sub, color, onPress }) {
  return (
    <TouchableOpacity style={styles.featureButton} onPress={onPress}>
      <IconBubble label={icon} color={color} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSub}>{sub}</Text>
      <Text style={styles.featureChevron}>{">"}</Text>
    </TouchableOpacity>
  );
}

function QuestionRow({ item, onPress, compact }) {
  return (
    <TouchableOpacity style={[styles.questionRow, compact && styles.questionRowCompact]} onPress={onPress}>
      <IconBubble label={item.icon} color={item.color} />
      <View style={styles.questionText}>
        <Text style={styles.questionTitle} numberOfLines={compact ? 1 : 2}>{item.title}</Text>
        <Text style={styles.questionMeta}>{item.meta}</Text>
      </View>
      <Text style={styles.questionTime}>{item.time}</Text>
      <Text style={styles.rowArrow}>{">"}</Text>
    </TouchableOpacity>
  );
}

function Composer({ placeholder, onUpload, onSend }) {
  return (
    <View style={styles.composer}>
      <TouchableOpacity style={styles.plus} onPress={onUpload}><Text style={styles.plusText}>+</Text></TouchableOpacity>
      <Text style={styles.composerText}>{placeholder}</Text>
      <Text style={styles.composeIcon}>cam</Text>
      <Text style={styles.composeIcon}>img</Text>
      <Text style={styles.composeIcon}>mic</Text>
      <TouchableOpacity style={styles.send} onPress={onSend}><Text style={styles.sendText}>-></Text></TouchableOpacity>
    </View>
  );
}

function UploadSheet({ onClose }) {
  const items = [
    ["cam", "Take Photo", "Use camera to capture question", colors.purple],
    ["img", "Choose from Gallery", "Select image from your gallery", colors.blue],
    ["pdf", "Upload PDF", "Upload question from PDF file", colors.green],
    ["doc", "Upload Document", "Upload question from document", "#F5A623"]
  ];
  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.overlayFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Upload Question</Text>
        <Text style={styles.sheetBody}>Choose an option to upload your question</Text>
        {items.map(([icon, title, sub, color]) => (
          <TouchableOpacity style={styles.uploadRow} key={title}>
            <IconBubble label={icon} color={color} />
            <View style={styles.questionText}>
              <Text style={styles.uploadTitle}>{title}</Text>
              <Text style={styles.questionMeta}>{sub}</Text>
            </View>
            <Text style={styles.rowArrow}>{">"}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>X  Cancel</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function SideDrawer({ setScreen, onClose }) {
  const go = (screen) => {
    onClose();
    setScreen(screen);
  };
  return (
    <View style={styles.drawerWrap}>
      <View style={styles.drawer}>
        <View style={styles.drawerProfile}>
          <View style={styles.avatar}><Text style={styles.avatarText}>AV</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>Aman Verma</Text>
            <Text style={styles.badge}>Pro Student</Text>
          </View>
          <TouchableOpacity onPress={() => go("profile")}><Text style={styles.rowArrow}>{">"}</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.newQuestion} onPress={() => go("home")}>
          <IconBubble label="+" color={colors.purple} />
          <Text style={styles.newQuestionText}>New Question</Text>
        </TouchableOpacity>
        <Text style={styles.drawerHeading}>History</Text>
        {historyGroups.slice(0, 3).map((group) => (
          <View key={group.label}>
            <Text style={styles.drawerDate}>{group.label}</Text>
            {group.items.slice(0, 2).map((item) => <QuestionRow compact key={item.title} item={item} onPress={() => go("solution")} />)}
          </View>
        ))}
        <TouchableOpacity style={styles.upgradeCard} onPress={() => go("premium")}>
          <IconBubble label="pro" color={colors.purple} />
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadTitle}>Upgrade to Pro</Text>
            <Text style={styles.questionMeta}>Unlock unlimited questions, PDF export, and more.</Text>
          </View>
          <Text style={styles.rowArrow}>{">"}</Text>
        </TouchableOpacity>
        <DrawerLink label="Settings" onPress={() => go("settings")} />
        <DrawerLink label="Help & Support" />
        <DrawerLink label="Logout" />
      </View>
      <TouchableOpacity style={styles.drawerRest} onPress={onClose} />
    </View>
  );
}

function DrawerLink({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.drawerLink} onPress={onPress}>
      <IconBubble label={label.slice(0, 2)} size={42} />
      <Text style={styles.drawerLinkText}>{label}</Text>
      <Text style={styles.rowArrow}>{">"}</Text>
    </TouchableOpacity>
  );
}

function SolutionScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: 188 }]}>
        <Header onMenu={() => setScreen("home")} />
        <View style={styles.userBubble}>
          <View style={styles.questionPhoto}><Text style={styles.photoText}>If x^2 + 5x + 6 = 0,{"\n"}find the value of x.</Text></View>
          <View style={styles.bubbleFoot}><Text style={styles.bubbleTitle}>Solve this question</Text><Text style={styles.questionTime}>10:30 AM</Text></View>
        </View>
        <View style={styles.aiLine}>
          <IconBubble label="AI" />
          <Text style={styles.aiName}>Brainory AI</Text>
          <Text style={styles.questionTime}>10:31 AM</Text>
          <Text style={styles.modePill}>Standard Solution</Text>
        </View>
        <View style={styles.solutionBox}>
          <SolutionBlock icon="Q" title="Question Analysis" body="We need to solve the quadratic equation x^2 + 5x + 6 = 0." />
          <SolutionBlock icon="1" title="Step 1: Factor the quadratic equation" body="We need two numbers that multiply to 6 and add to 5. Those numbers are 2 and 3.\n\nx^2 + 5x + 6 = (x + 2)(x + 3)" />
          <SolutionBlock icon="2" title="Step 2: Apply Zero Product Property" body="If (x + 2)(x + 3) = 0, then\n\nx + 2 = 0  or  x + 3 = 0" />
          <SolutionBlock icon="3" title="Step 3: Solve for x" body="x = -2  or  x = -3" />
          <View style={styles.finalAnswer}>
            <IconBubble label="ok" color={colors.green} />
            <View>
              <Text style={styles.solutionTitle}>Final Answer</Text>
              <Text style={styles.answerPill}>x = -2, -3</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.moreDetails}><Text style={styles.moreDetailsText}>Explain with more details</Text></TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>You might also ask</Text>
        <View style={styles.suggestions}>
          {["Solve similar question", "Graph the equation", "Real life example"].map((x) => <Text key={x} style={styles.suggestion}>{x}  {">"}</Text>)}
        </View>
      </ScrollView>
      <Composer placeholder="Ask a follow up..." onUpload={() => {}} onSend={() => {}} />
      <View style={styles.answerTools}>
        {["Copy", "Listen", "Share", "Download PDF"].map((x) => <TouchableOpacity key={x} style={styles.answerTool}><Text style={styles.answerToolText}>{x}</Text></TouchableOpacity>)}
      </View>
    </SafeAreaView>
  );
}

function SolutionBlock({ icon, title, body }) {
  return (
    <View style={styles.solutionBlock}>
      <IconBubble label={icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.solutionTitle}>{title}</Text>
        <Text style={styles.solutionBody}>{body}</Text>
      </View>
    </View>
  );
}

function HistoryScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Header title="Search History" onBack={() => setScreen("home")} right="trash" />
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>O</Text>
          <Text style={styles.searchText}>Search your questions...</Text>
          <Text style={styles.filter}>filter</Text>
        </View>
        <View style={styles.chips}>
          {["All", "Math", "Physics", "Chemistry", "Biology"].map((chip, i) => <Text key={chip} style={[styles.chip, i === 0 && styles.chipActive]}>{chip}</Text>)}
        </View>
        {historyGroups.map((group) => (
          <View key={group.label}>
            <View style={styles.historyHead}>
              <Text style={styles.historyHeadText}>{group.label} <Text style={styles.historyDate}>{group.date}</Text></Text>
              <Text style={styles.questionMeta}>{group.items.length} items</Text>
            </View>
            <View style={styles.groupCard}>{group.items.map((item) => <QuestionRow key={item.title} item={item} onPress={() => setScreen("solution")} />)}</View>
          </View>
        ))}
        <Text style={styles.privacyPill}>Your history is safe and private.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: 110 }]}>
        <Header title="Settings" onBack={() => setScreen("home")} />
        <ProfileCard onPress={() => setScreen("profile")} />
        <SettingsGroup title="General" items={["Profile", "Study Preferences", "Language", "Appearance"]} values={{ Language: "English", Appearance: "Light" }} onProfile={() => setScreen("profile")} />
        <SettingsGroup title="App Settings" items={["Notifications", "Privacy & Security", "Clear Chat History", "Download Settings", "Storage Usage"]} values={{ Notifications: "on", "Storage Usage": "128 MB" }} />
        <SettingsGroup title="Support" items={["Help & Support", "Rate Us", "About"]} values={{ About: "v1.2.3" }} />
        <TouchableOpacity style={styles.logout}><Text style={styles.logoutText}>Log Out</Text></TouchableOpacity>
      </ScrollView>
      <BottomTabs active="Settings" setScreen={setScreen} />
    </SafeAreaView>
  );
}

function ProfileCard({ onPress }) {
  return (
    <TouchableOpacity style={styles.profileCard} onPress={onPress}>
      <View style={styles.avatarLarge}><Text style={styles.avatarText}>AV</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.profileBig}>Aman Verma</Text>
        <Text style={styles.questionMeta}>aman.verma@student.com</Text>
        <Text style={styles.badge}>Pro Student</Text>
      </View>
      <Text style={styles.rowArrow}>{">"}</Text>
    </TouchableOpacity>
  );
}

function SettingsGroup({ title, items, values = {}, onProfile }) {
  return (
    <View>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.settingsCard}>
        {items.map((item) => (
          <TouchableOpacity style={styles.settingRow} key={item} onPress={item === "Profile" ? onProfile : undefined}>
            <IconBubble label={item.slice(0, 2)} color={item === "Delete Account" ? colors.red : colors.purple} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{item}</Text>
              <Text style={styles.questionMeta}>{subtitle(item)}</Text>
            </View>
            {values[item] === "on" ? <View style={styles.toggle}><View style={styles.toggleKnob} /></View> : <Text style={styles.value}>{values[item] || ">"}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function subtitle(item) {
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

function ProfileScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={[styles.pad, { paddingBottom: 110 }]}>
        <Header title="My Profile" onBack={() => setScreen("settings")} />
        <View style={styles.profileHero}>
          <View style={styles.avatarXL}><Text style={styles.avatarText}>AV</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileBig}>Aman Verma</Text>
            <Text style={styles.questionMeta}>aman.verma@student.com</Text>
            <Text style={styles.badge}>Pro Student</Text>
            <Text style={styles.bio}>I love solving problems and learning new things every day.</Text>
          </View>
        </View>
        <View style={styles.stats}>
          {[
            ["128", "Questions Asked"],
            ["126", "Questions Solved"],
            ["15", "Day Streak"],
            ["4.8", "Rating"]
          ].map(([n, l]) => <View style={styles.stat} key={l}><Text style={styles.statNum}>{n}</Text><Text style={styles.questionMeta}>{l}</Text></View>)}
        </View>
        <SettingsGroup title="Account" items={["Personal Information", "Change Password", "Account Security"]} />
        <SettingsGroup title="Learning Preferences" items={["Subjects of Interest", "Class / Grade", "Learning Goal"]} />
        <SettingsGroup title="Other" items={["Export My Data", "Delete Account"]} />
      </ScrollView>
      <BottomTabs active="Profile" setScreen={setScreen} />
    </SafeAreaView>
  );
}

function PremiumScreen({ setScreen }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Header title="Upgrade to Premium" onBack={() => setScreen("home")} right="restore" />
        <View style={styles.premiumHero}>
          <View style={{ flex: 1 }}>
            <Text style={styles.premiumTitle}>Unlock the full power of{"\n"}Brainory AI</Text>
            <Text style={styles.heroSub}>Get unlimited access, advanced AI models, and premium features to learn without limits.</Text>
          </View>
          <Robot size={118} />
        </View>
        <View style={styles.benefits}>
          {["Unlimited Questions", "Image Upload (Unlimited)", "Advanced AI Models", "Step-by-Step Solutions", "PDF & Document Chat", "Ad-Free Experience"].map((b) => (
            <View style={styles.benefit} key={b}>
              <IconBubble label="*" />
              <View style={{ flex: 1 }}><Text style={styles.settingTitle}>{b}</Text><Text style={styles.questionMeta}>{benefitSub(b)}</Text></View>
            </View>
          ))}
        </View>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.trialPill}>7-Day Free Trial</Text>
        </View>
        <Plan months="12 Months" price="Rs 2499" old="Rs 3399" note="Just Rs208/month" selected />
        <Plan months="6 Months" price="Rs 1999" old="Rs 2499" note="Just Rs333/month" />
        <Plan months="3 Months" price="Rs 1599" old="Rs 1839" note="Just Rs533/month" />
        <Text style={styles.secure}>Secure Payments{"\n"}100% safe and secure payments. Cancel anytime.</Text>
        <TouchableOpacity style={styles.cta}><Text style={styles.ctaText}>Start 7-Day Free Trial</Text></TouchableOpacity>
        <Text style={styles.safeHistory}>No charges until trial ends</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function benefitSub(b) {
  return {
    "Unlimited Questions": "Ask and solve unlimited questions",
    "Image Upload (Unlimited)": "Upload unlimited images for questions",
    "Advanced AI Models": "Get better and faster solutions",
    "Step-by-Step Solutions": "Detailed, easy answers",
    "PDF & Document Chat": "Chat with PDFs and notes",
    "Ad-Free Experience": "Learn without distractions"
  }[b];
}

function Plan({ months, price, old, note, selected }) {
  return (
    <TouchableOpacity style={[styles.plan, selected && styles.planSelected]}>
      <View style={[styles.radio, selected && styles.radioActive]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.planTitle}>{months}</Text>
        <Text style={styles.questionMeta}>Billed {months === "12 Months" ? "annually" : `every ${months.toLowerCase()}`}</Text>
        <Text style={styles.planNote}>{note}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.save}>Save</Text>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.oldPrice}>{old}</Text>
      </View>
    </TouchableOpacity>
  );
}

function BottomTabs({ active, setScreen }) {
  const tabs = [["Home", "home"], ["History", "history"], ["Premium", "premium"], ["Settings", "settings"], ["Profile", "profile"]];
  return (
    <View style={styles.tabs}>
      {tabs.map(([label, screen]) => (
        <TouchableOpacity key={label} style={styles.tab} onPress={() => setScreen(screen)}>
          <Text style={[styles.tabIcon, active === label && styles.tabActive]}>*</Text>
          <Text style={[styles.tabText, active === label && styles.tabActive]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState("splash");

  if (screen === "splash") return <SplashScreen onDone={() => setScreen("onboarding")} />;
  if (screen === "onboarding") return <OnboardingScreen onDone={() => setScreen("home")} />;
  if (screen === "solution") return <SolutionScreen setScreen={setScreen} />;
  if (screen === "history") return <HistoryScreen setScreen={setScreen} />;
  if (screen === "settings") return <SettingsScreen setScreen={setScreen} />;
  if (screen === "profile") return <ProfileScreen setScreen={setScreen} />;
  if (screen === "premium") return <PremiumScreen setScreen={setScreen} />;
  return <HomeScreen setScreen={setScreen} />;
}

const shadow = {
  shadowColor: "#8A8FB5",
  shadowOpacity: 0.16,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },
  elevation: 5
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  pad: { padding: 22, paddingBottom: 138 },
  splash: { flex: 1, backgroundColor: "#F1EFFF", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  splashDecorOne: { position: "absolute", bottom: -60, left: -40, width: 310, height: 160, borderRadius: 120, backgroundColor: "#E0DAFF", transform: [{ rotate: "-10deg" }] },
  splashDecorTwo: { position: "absolute", bottom: -50, right: -70, width: 330, height: 150, borderRadius: 120, backgroundColor: "#DED9FF", transform: [{ rotate: "14deg" }] },
  splashSub: { color: colors.muted, fontSize: 14, fontWeight: "800", marginTop: 8 },
  splashTip: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.white, borderRadius: 14, padding: 12, marginTop: 70, ...shadow },
  splashTipText: { color: colors.muted, fontSize: 11, lineHeight: 16, fontWeight: "800" },
  loadingTrack: { position: "absolute", bottom: 42, width: 134, height: 5, borderRadius: 4, backgroundColor: "#D7D1F9" },
  loadingFill: { width: 82, height: 5, borderRadius: 4, backgroundColor: colors.purple },
  loadingText: { position: "absolute", bottom: 22, color: colors.muted, fontSize: 10 },
  brand: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  brandText: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  brandAi: { color: colors.purple, fontSize: 24, fontWeight: "900" },
  brandTextLarge: { fontSize: 36 },
  spark: { color: colors.purple, fontSize: 15, fontWeight: "900", marginLeft: 4 },
  robot: { alignItems: "center", justifyContent: "center" },
  robotGlow: { position: "absolute", backgroundColor: "#E5DFFF" },
  robotHead: { backgroundColor: colors.white, borderRadius: 26, alignItems: "center", justifyContent: "center", ...shadow },
  robotFace: { width: 58, height: 36, borderRadius: 14, backgroundColor: colors.ink, flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  robotEye: { width: 10, height: 18, borderRadius: 8, backgroundColor: colors.white },
  robotAntenna: { position: "absolute", top: 18, width: 14, height: 26, borderRadius: 8, backgroundColor: colors.purple },
  onboardSafe: { flex: 1, backgroundColor: colors.bg, padding: 22 },
  phoneStatus: { height: 36, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  time: { color: "#111", fontWeight: "900", fontSize: 13 },
  statusIcons: { color: "#111", fontSize: 10, fontWeight: "900" },
  skip: { position: "absolute", right: 22, top: 58, zIndex: 2 },
  skipText: { color: colors.purple, fontWeight: "900" },
  onboardArt: { flex: 1, alignItems: "center", justifyContent: "center" },
  artBlob: { width: 232, height: 232, borderRadius: 92, backgroundColor: "#E8E2FF", alignItems: "center", justifyContent: "center" },
  paper: { width: 134, height: 166, borderRadius: 12, backgroundColor: colors.white, padding: 18, transform: [{ rotate: "6deg" }], ...shadow },
  formula: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  lineLong: { height: 8, borderRadius: 6, backgroundColor: "#DDDFF0", marginTop: 14, width: "90%" },
  lineShort: { height: 8, borderRadius: 6, backgroundColor: "#E7E8F4", marginTop: 10, width: "62%" },
  triangle: { marginTop: 18, width: 0, height: 0, borderLeftWidth: 34, borderRightWidth: 10, borderBottomWidth: 44, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#CBD1E9" },
  cameraBadge: { position: "absolute", left: 36, bottom: 28, width: 58, height: 58, borderRadius: 16, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", ...shadow },
  cameraText: { color: colors.white, fontWeight: "900" },
  chatTop: { position: "absolute", top: 32, right: 36, backgroundColor: colors.purple, borderRadius: 14, padding: 14 },
  chatTopText: { color: colors.white, fontWeight: "800", fontSize: 12 },
  solutionCardMini: { width: 180, height: 132, borderRadius: 18, backgroundColor: colors.white, padding: 18, alignItems: "center", ...shadow },
  formulaPill: { color: colors.purple, backgroundColor: colors.soft, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, marginTop: 10, fontWeight: "900" },
  historyMini: { width: 180, borderRadius: 18, backgroundColor: colors.white, padding: 14, ...shadow },
  historyMiniHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  historyMiniTitle: { color: colors.ink, fontWeight: "900" },
  historyMiniRow: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 8 },
  historyMiniQuestion: { color: colors.ink, fontWeight: "900", fontSize: 10 },
  miniLine: { height: 4, borderRadius: 4, backgroundColor: "#E6E8F4", marginTop: 4 },
  miniTime: { color: colors.muted, fontSize: 8, fontWeight: "900" },
  clockBadge: { position: "absolute", right: 18, bottom: 30, width: 58, height: 58, borderRadius: 29, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", ...shadow },
  clockText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  onboardTitle: { color: colors.ink, fontSize: 28, fontWeight: "900", lineHeight: 36, textAlign: "center" },
  onboardAccent: { color: colors.purple },
  onboardBody: { color: colors.muted, textAlign: "center", fontSize: 15, lineHeight: 23, marginTop: 14, fontWeight: "600" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 12, marginVertical: 34 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: "#D6D6EA" },
  dotActive: { backgroundColor: colors.purple },
  nextButton: { height: 60, borderRadius: 12, backgroundColor: colors.purple2, flexDirection: "row", alignItems: "center", justifyContent: "center", ...shadow },
  nextText: { color: colors.white, fontWeight: "900", fontSize: 16 },
  nextArrow: { position: "absolute", right: 24, color: colors.white, fontWeight: "900", fontSize: 18 },
  header: { height: 68, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  square: { width: 54, height: 54, borderRadius: 16, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", ...shadow },
  squareText: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  headerTitle: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  pro: { minWidth: 74, height: 44, borderRadius: 22, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  proText: { color: colors.purple, fontWeight: "900", fontSize: 16 },
  restore: { color: colors.purple, fontWeight: "900", fontSize: 16 },
  heroCard: { marginTop: 12, backgroundColor: colors.white, borderRadius: 30, padding: 26, alignItems: "center", ...shadow },
  heroTitle: { color: colors.ink, fontSize: 34, fontWeight: "900", marginTop: 12 },
  heroSub: { color: colors.muted, fontSize: 18, lineHeight: 28, textAlign: "center", marginTop: 10 },
  homeActions: { flexDirection: "row", gap: 12, marginTop: 28 },
  featureButton: { flex: 1, minHeight: 146, backgroundColor: "#FAFBFF", borderRadius: 22, padding: 18, ...shadow },
  featureTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 18 },
  featureSub: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  featureChevron: { position: "absolute", right: 16, bottom: 48, color: colors.ink, fontSize: 28 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 14 },
  sectionTitle: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  link: { color: colors.purple, fontSize: 16, fontWeight: "900" },
  questionRow: { minHeight: 84, backgroundColor: colors.white, borderRadius: 20, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "center", ...shadow },
  questionRowCompact: { backgroundColor: "transparent", shadowOpacity: 0, elevation: 0, paddingHorizontal: 0, minHeight: 66 },
  questionText: { flex: 1, marginLeft: 14 },
  questionTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  questionMeta: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  questionTime: { color: colors.muted, fontSize: 13, fontWeight: "800" },
  rowArrow: { color: colors.muted, fontSize: 22, marginLeft: 8 },
  safeHistory: { color: colors.muted, textAlign: "center", marginTop: 16, fontSize: 14, fontWeight: "700" },
  composer: { position: "absolute", left: 18, right: 18, bottom: 18, minHeight: 76, borderRadius: 24, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderWidth: 1, borderColor: "#DCD5FF", ...shadow },
  plus: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.purple2, alignItems: "center", justifyContent: "center" },
  plusText: { color: colors.white, fontSize: 34, lineHeight: 36 },
  composerText: { flex: 1, marginLeft: 16, color: colors.muted, fontSize: 18, fontWeight: "800" },
  composeIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#F4F5FC", color: colors.muted, textAlign: "center", textAlignVertical: "center", fontSize: 10, fontWeight: "900", marginLeft: 6 },
  send: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.purple2, alignItems: "center", justifyContent: "center", marginLeft: 8 },
  sendText: { color: colors.white, fontSize: 16, fontWeight: "900" },
  iconBubble: { alignItems: "center", justifyContent: "center" },
  iconLabel: { fontWeight: "900" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,8,20,0.55)", justifyContent: "flex-end" },
  overlayFill: { flex: 1 },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, paddingBottom: 34 },
  sheetHandle: { width: 70, height: 6, borderRadius: 4, backgroundColor: "#D9DCEB", alignSelf: "center", marginBottom: 20 },
  sheetTitle: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  sheetBody: { color: colors.muted, fontSize: 16, marginTop: 8, marginBottom: 20 },
  uploadRow: { minHeight: 82, backgroundColor: colors.white, borderRadius: 18, padding: 14, flexDirection: "row", alignItems: "center", marginBottom: 12, ...shadow },
  uploadTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  cancel: { height: 62, borderRadius: 18, backgroundColor: "#FAFAFE", alignItems: "center", justifyContent: "center", marginTop: 8 },
  cancelText: { color: colors.red, fontSize: 18, fontWeight: "900" },
  drawerWrap: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(6,8,20,0.45)", flexDirection: "row" },
  drawer: { width: "72%", backgroundColor: colors.bg, paddingTop: 50, paddingHorizontal: 18, borderTopRightRadius: 24, borderBottomRightRadius: 24 },
  drawerRest: { flex: 1 },
  drawerProfile: { flexDirection: "row", alignItems: "center", minHeight: 88, gap: 14 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.purple, fontWeight: "900", fontSize: 20 },
  profileName: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  badge: { color: colors.purple, backgroundColor: colors.soft, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 8, fontWeight: "900" },
  newQuestion: { height: 78, borderRadius: 18, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, marginVertical: 20, ...shadow },
  newQuestionText: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  drawerHeading: { color: colors.ink, fontSize: 16, fontWeight: "900", marginBottom: 8 },
  drawerDate: { color: colors.purple, fontSize: 15, fontWeight: "900", backgroundColor: colors.soft, padding: 12, borderRadius: 14, marginTop: 8 },
  upgradeCard: { minHeight: 88, borderRadius: 20, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", padding: 14, marginVertical: 18, ...shadow },
  drawerLink: { height: 58, flexDirection: "row", alignItems: "center", gap: 14 },
  drawerLinkText: { flex: 1, color: colors.ink, fontSize: 17, fontWeight: "900" },
  userBubble: { alignSelf: "flex-end", width: "78%", backgroundColor: colors.soft, borderRadius: 22, padding: 14, marginTop: 18 },
  questionPhoto: { height: 126, borderRadius: 14, backgroundColor: "#D8D5D2", alignItems: "center", justifyContent: "center", padding: 14 },
  photoText: { color: "#333", fontSize: 19, lineHeight: 30, fontWeight: "700", textAlign: "center" },
  bubbleFoot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  bubbleTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  aiLine: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 26 },
  aiName: { color: colors.purple, fontSize: 18, fontWeight: "900" },
  modePill: { marginLeft: "auto", color: colors.purple, backgroundColor: colors.soft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, fontSize: 12, fontWeight: "900" },
  solutionBox: { backgroundColor: colors.white, borderRadius: 24, padding: 20, marginTop: 14, ...shadow },
  solutionBlock: { flexDirection: "row", gap: 14, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  solutionTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  solutionBody: { color: colors.ink, fontSize: 16, lineHeight: 26, marginTop: 10 },
  finalAnswer: { flexDirection: "row", gap: 14, paddingTop: 18 },
  answerPill: { color: colors.green, backgroundColor: "#DDF8EC", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, fontSize: 18, fontWeight: "900", marginTop: 12 },
  moreDetails: { alignSelf: "flex-start", borderWidth: 1, borderColor: "#D8D0FF", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginTop: 18 },
  moreDetailsText: { color: colors.purple, fontSize: 15, fontWeight: "900" },
  suggestions: { flexDirection: "row", gap: 10, marginTop: 12 },
  suggestion: { flex: 1, minHeight: 54, borderRadius: 12, borderWidth: 1, borderColor: "#D8DDF4", padding: 10, color: colors.ink, fontSize: 12, fontWeight: "900" },
  answerTools: { position: "absolute", left: 18, right: 18, bottom: 108, flexDirection: "row", gap: 10 },
  answerTool: { flex: 1, height: 48, borderRadius: 12, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E5F5" },
  answerToolText: { color: colors.muted, fontWeight: "900", fontSize: 12 },
  searchBox: { height: 76, borderRadius: 22, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, marginTop: 18, ...shadow },
  searchIcon: { color: colors.muted, fontSize: 24, marginRight: 16 },
  searchText: { flex: 1, color: colors.muted, fontSize: 18, fontWeight: "800" },
  filter: { color: colors.purple, fontWeight: "900" },
  chips: { flexDirection: "row", gap: 10, marginTop: 22 },
  chip: { height: 46, paddingHorizontal: 18, borderRadius: 16, backgroundColor: "#F0F2FA", color: colors.ink, textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  chipActive: { backgroundColor: colors.purple, color: colors.white },
  historyHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 10 },
  historyHeadText: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  historyDate: { color: colors.muted, fontWeight: "700" },
  groupCard: { backgroundColor: colors.white, borderRadius: 22, paddingVertical: 4, ...shadow },
  privacyPill: { color: colors.muted, backgroundColor: colors.soft, borderRadius: 18, padding: 18, marginTop: 24, textAlign: "center", fontWeight: "900" },
  profileCard: { minHeight: 130, borderRadius: 24, backgroundColor: colors.white, padding: 22, flexDirection: "row", alignItems: "center", gap: 18, marginTop: 14, ...shadow },
  avatarLarge: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  profileBig: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  groupTitle: { color: colors.muted, fontSize: 16, fontWeight: "900", marginTop: 24, marginBottom: 10 },
  settingsCard: { backgroundColor: colors.white, borderRadius: 22, paddingHorizontal: 18, ...shadow },
  settingRow: { minHeight: 74, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.line, gap: 14 },
  settingTitle: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  value: { color: colors.purple, fontSize: 15, fontWeight: "900" },
  toggle: { width: 62, height: 34, borderRadius: 17, backgroundColor: colors.purple, alignItems: "flex-end", justifyContent: "center", padding: 4 },
  toggleKnob: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.white },
  logout: { height: 62, backgroundColor: colors.white, borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 24, ...shadow },
  logoutText: { color: colors.red, fontSize: 17, fontWeight: "900" },
  tabs: { position: "absolute", left: 0, right: 0, bottom: 0, height: 84, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: colors.line },
  tab: { alignItems: "center", gap: 4 },
  tabIcon: { color: colors.muted, fontSize: 18, fontWeight: "900" },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: "900" },
  tabActive: { color: colors.purple },
  profileHero: { borderRadius: 24, backgroundColor: colors.white, padding: 24, flexDirection: "row", gap: 22, alignItems: "center", marginTop: 14, ...shadow },
  avatarXL: { width: 126, height: 126, borderRadius: 63, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" },
  bio: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 12 },
  stats: { flexDirection: "row", backgroundColor: colors.white, borderRadius: 22, paddingVertical: 22, marginTop: 22, ...shadow },
  stat: { flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: colors.line },
  statNum: { color: colors.ink, fontSize: 22, fontWeight: "900" },
  premiumHero: { flexDirection: "row", alignItems: "center", marginTop: 28 },
  premiumTitle: { color: colors.ink, fontSize: 26, lineHeight: 37, fontWeight: "900" },
  benefits: { backgroundColor: colors.white, borderRadius: 24, padding: 18, marginTop: 24, flexDirection: "row", flexWrap: "wrap", ...shadow },
  benefit: { width: "50%", flexDirection: "row", gap: 12, paddingVertical: 12 },
  trialPill: { color: colors.purple, backgroundColor: colors.soft, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, fontWeight: "900" },
  plan: { minHeight: 116, backgroundColor: colors.white, borderRadius: 20, padding: 18, marginBottom: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "transparent", ...shadow },
  planSelected: { borderColor: colors.purple },
  radio: { width: 30, height: 30, borderRadius: 15, borderWidth: 3, borderColor: "#B8BED5", marginRight: 16 },
  radioActive: { borderColor: colors.purple, backgroundColor: colors.soft },
  planTitle: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  planNote: { alignSelf: "flex-start", color: colors.purple, backgroundColor: colors.soft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 12, fontWeight: "900" },
  save: { color: colors.green, backgroundColor: "#E2F8EE", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, fontWeight: "900" },
  price: { color: colors.ink, fontSize: 23, fontWeight: "900", marginTop: 8 },
  oldPrice: { color: colors.muted, textDecorationLine: "line-through", fontWeight: "800" },
  secure: { color: colors.muted, fontSize: 15, lineHeight: 25, textAlign: "center", marginVertical: 24, fontWeight: "700" },
  cta: { height: 70, borderRadius: 20, backgroundColor: colors.purple, alignItems: "center", justifyContent: "center", ...shadow },
  ctaText: { color: colors.white, fontSize: 22, fontWeight: "900" }
});
