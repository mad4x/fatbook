"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getToken } from "@/lib/jwt";

const getTokenFromCookie = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken() || getTokenFromCookie();
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    if (!getToken()) {
      localStorage.setItem("token", token);
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGate;
