import { View, StyleSheet } from "react-native";
import { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest } from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/src/lib/supabaseClient";
import { router } from "expo-router";
import { Text } from "react-native-paper";
import { PostgrestError } from "@supabase/supabase-js";
import { Button, ButtonText } from "@/components/ui/button";

WebBrowser.maybeCompleteAuthSession();

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: "active" | "inactive" | "banned";
  last_sign_in: string;
  created_at: string;
  updated_at: string;
}

export default function Login() {
  const [request, response, promptAsync] = useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme:
        "com.googleusercontent.apps.242841273199-cj9bqed3vvo1pcdf96blocgnrv83jump",
    }),
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    const attemptSignIn = async (): Promise<any> => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.signInWithIdToken({
            provider: "google",
            token: idToken,
          });

        if (authError) {
          throw authError;
        }

        return authData;
      } catch (error) {
        if (
          retryCount < MAX_RETRIES &&
          error instanceof Error &&
          error.message.includes("Network request failed")
        ) {
          retryCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1))
          );
          return attemptSignIn();
        }
        throw error;
      }
    };

    try {
      const authData = await attemptSignIn();

      if (authData.user) {
        // Prepare user data
        const userData = {
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata.full_name,
          avatar_url: authData.user.user_metadata.avatar_url,
          status: "active",
          last_sign_in: new Date().toISOString(),
        };

        // Insert or update user data
        const { data: upsertedUser, error: upsertError } = await supabase
          .from("users")
          .upsert([userData], {
            onConflict: "id",
          });

        if (upsertError) {
          console.error("Error updating user data:", upsertError);
          return;
        }

        // Check user status before allowing access
        const { data: userStatus, error: userError } = await supabase
          .from("users")
          .select("status")
          .eq("id", authData.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user status:", userError);
          return;
        }

        if (userStatus.status === "banned") {
          console.error("User is banned");
          await supabase.auth.signOut();
          return;
        }

        router.replace("/(tabs)/create");
      }
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <Button
        className="bg-success-300 focus:bg-success-50"
        onPress={() => promptAsync()}
      >
        <ButtonText>Sign in with Google</ButtonText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 24,
  },
  button: {
    width: "100%",
    maxWidth: 300,
  },
});
