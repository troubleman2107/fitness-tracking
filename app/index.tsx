import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "@/src/lib/supabaseClient";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log("🚀 ~ App ~ isAuthenticated:", isAuthenticated);

  useEffect(() => {
    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", !!session);
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log("Session check:", !!session, "Error:", error);

      if (session?.user) {
        console.log("User found:", session.user.email);
        setIsAuthenticated(true);
      } else {
        console.log("No session found");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking session:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Redirect href={isAuthenticated ? "/(tabs)/create" : "/(tabs)/create"} />
  );
};

export default App;
