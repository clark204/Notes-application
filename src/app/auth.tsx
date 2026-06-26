import { supabase } from "@/lib/supabase";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Screen = "login" | "signup" | "verify";

export default function Auth() {
    const [screen, setScreen] = useState<Screen>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                Alert.alert("Sign in failed", error.message);
                return;
            }
            router.replace("/");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        if (!email || !password) return;
        if (password.length < 6) {
            Alert.alert("Weak password", "Password must be at least 6 characters.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                Alert.alert("Sign up failed", error.message);
                return;
            }
            setScreen("verify");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Enter your email", "Please enter your email address first.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                Alert.alert("Error", error.message);
                return;
            }
            Alert.alert("Email sent", "Check your email for a password reset link.");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Verify screen
    if (screen === "verify") {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.inner}>
                    <View style={styles.topSection}>
                        <View style={[styles.logoBox, { backgroundColor: "#CF5C36" }]}>
                            <FontAwesome name="envelope" size={32} color="#fff" />
                        </View>
                        <Text style={styles.appName}>Check your email</Text>
                        <Text style={styles.tagline}>We sent a verification link to</Text>
                        <Text style={[styles.tagline, { color: "#453A49", fontWeight: "700" }]}>
                            {email}
                        </Text>
                    </View>

                    <View style={styles.verifyBox}>
                        <FontAwesome name="info-circle" size={16} color="#888" />
                        <Text style={styles.verifyInfo}>
                            Click the link in the email to verify your account, then come back to sign in.
                        </Text>
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.8 : 1 }]}
                        onPress={() => setScreen("login")}
                    >
                        <Text style={styles.submitText}>Go to Sign In</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.resendBtn, { opacity: pressed ? 0.7 : 1 }]}
                        onPress={handleSignUp}
                        disabled={loading}
                    >
                        <Text style={styles.resendText}>
                            {loading ? "Sending..." : "Resend verification email"}
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inner}
            >
                {/* Back button */}
                <Pressable style={styles.closeBtn} onPress={() => router.back()}>
                    <FontAwesome name="times" size={20} color="#aaa" />
                </Pressable>

                {/* Logo */}
                <View style={styles.topSection}>
                    <View style={styles.logoBox}>
                        <FontAwesome name="sticky-note" size={32} color="#fff" />
                    </View>
                    <Text style={styles.appName}>Notes</Text>
                    <Text style={styles.tagline}>
                        {screen === "login" ? "Welcome back!" : "Create your account"}
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputWrapper}>
                        <FontAwesome name="envelope-o" size={16} color="#aaa" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor="#bbb"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <FontAwesome name="lock" size={18} color="#aaa" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#bbb"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                            <FontAwesome
                                name={showPassword ? "eye-slash" : "eye"}
                                size={16}
                                color="#aaa"
                            />
                        </Pressable>
                    </View>

                    {screen === "login" && (
                        <Pressable style={styles.forgotBtn} onPress={handleForgotPassword}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={({ pressed }) => [
                            styles.submitBtn,
                            { opacity: pressed || loading ? 0.8 : 1 },
                        ]}
                        onPress={screen === "login" ? handleSignIn : handleSignUp}
                        disabled={loading}
                    >
                        <Text style={styles.submitText}>
                            {loading ? "Please wait..." : screen === "login" ? "Sign In" : "Create Account"}
                        </Text>
                    </Pressable>

                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.divider} />
                    </View>

                    <Pressable
                        style={({ pressed }) => [styles.toggleBtn, { opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => setScreen(screen === "login" ? "signup" : "login")}
                    >
                        <Text style={styles.toggleText}>
                            {screen === "login" ? "Don't have an account? " : "Already have an account? "}
                            <Text style={styles.toggleLink}>
                                {screen === "login" ? "Create one" : "Sign in"}
                            </Text>
                        </Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FAF7F2" },
    inner: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
    closeBtn: {
        position: "absolute", top: 20, right: 24,
        width: 36, height: 36, alignItems: "center", justifyContent: "center",
    },
    topSection: { alignItems: "center", marginBottom: 40, gap: 8 },
    logoBox: {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: "#453A49", alignItems: "center",
        justifyContent: "center", marginBottom: 8,
    },
    appName: { fontSize: 28, fontWeight: "800", color: "#2C2C2C", letterSpacing: -0.5 },
    tagline: { fontSize: 15, color: "#aaa", textAlign: "center" },
    form: { gap: 14 },
    inputWrapper: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fff", borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 4,
        borderWidth: 1, borderColor: "#eee", elevation: 1,
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 16, color: "#333", paddingVertical: 14 },
    eyeBtn: { padding: 8 },
    forgotBtn: { alignSelf: "flex-end", marginTop: -4 },
    forgotText: { fontSize: 13, color: "#CF5C36", fontWeight: "600" },
    submitBtn: {
        backgroundColor: "#453A49", borderRadius: 14,
        paddingVertical: 16, alignItems: "center", marginTop: 4, elevation: 6,
    },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
    divider: { flex: 1, height: 1, backgroundColor: "#eee" },
    dividerText: { fontSize: 13, color: "#bbb" },
    toggleBtn: { alignItems: "center" },
    toggleText: { fontSize: 14, color: "#888" },
    toggleLink: { color: "#453A49", fontWeight: "700" },
    verifyBox: {
        flexDirection: "row", gap: 10, alignItems: "flex-start",
        backgroundColor: "#fff", borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: "#eee", marginBottom: 20,
    },
    verifyInfo: { flex: 1, fontSize: 14, color: "#888", lineHeight: 20 },
    resendBtn: { alignItems: "center", marginTop: 12 },
    resendText: { fontSize: 14, color: "#CF5C36", fontWeight: "600" },
});