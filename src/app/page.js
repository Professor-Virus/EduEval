"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import LoginForm from "./components/LoginForm";
import Home from "./components/Home";

export default function Page() {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      console.log("User is signed in:", user);
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || !isSignedIn) {
    return <LoginForm />;
  }

  return <Home />;
}