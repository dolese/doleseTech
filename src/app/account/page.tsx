"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

interface Me {
  phone: string | null;
  email: string | null;
  name: string | null;
  since: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.teacher) router.replace("/account/sign-in");
        else setMe(data.teacher);
      })
      .catch(() => router.replace("/account/sign-in"));
  }, [router]);

  async function signOut() {
    await fetch("/api/account/sign-out", { method: "POST" }).catch(() => {});
    router.replace("/");
  }

  return (
    <>
      <Nav />
      <main className="account-shell">
        <div className="admin-login-card account-card account-card-wide">
          <h1 className="admin-login-title">Your account</h1>
          {!me ? (
            <p className="admin-login-sub">Loading…</p>
          ) : (
            <>
              <dl className="account-details">
                {me.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>{me.phone}</dd>
                  </>
                )}
                {me.email && (
                  <>
                    <dt>Email</dt>
                    <dd>{me.email}</dd>
                  </>
                )}
                <dt>Member since</dt>
                <dd>{new Date(me.since).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</dd>
              </dl>
              <div className="account-section">
                <h2>Your purchases</h2>
                <p className="account-hint">Subject packs and exam credits you buy will appear here.</p>
              </div>
              <button type="button" className="admin-logout-btn" onClick={signOut}>
                Sign out
              </button>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
