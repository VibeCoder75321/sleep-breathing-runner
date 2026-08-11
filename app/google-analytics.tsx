"use client";

import Script from "next/script";
import { useState, useSyncExternalStore } from "react";

type ConsentChoice = "loading" | "undecided" | "granted" | "denied";

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_STORAGE_KEY = "sleep-study-check-analytics-consent";
const consentListeners = new Set<() => void>();

function getConsentSnapshot(): ConsentChoice {
  try {
    const savedChoice = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return savedChoice === "granted" || savedChoice === "denied"
      ? savedChoice
      : "undecided";
  } catch {
    return "undecided";
  }
}

function subscribeToConsent(onStoreChange: () => void) {
  consentListeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    consentListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

export default function GoogleAnalytics({
  measurementId,
}: {
  measurementId?: string;
}) {
  const consent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    () => "loading",
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  function saveConsent(choice: "granted" | "denied") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch {
      // Analytics consent still applies for the current page when storage is unavailable.
    }

    window.gtag?.("consent", "update", {
      analytics_storage: choice,
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });

    consentListeners.forEach((listener) => listener());
    setSettingsOpen(false);
  }

  if (!measurementId) {
    return null;
  }

  return (
    <>
      {consent === "granted" ? (
        <>
          <Script
            id="google-analytics-library"
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = window.gtag || gtag;
              gtag('consent', 'default', {
                analytics_storage: 'granted',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
              });
              gtag('js', new Date());
              gtag('config', '${measurementId}', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      ) : null}

      {consent === "undecided" || settingsOpen ? (
        <aside
          aria-label="Analytics preferences"
          className="analytics-consent"
          role="dialog"
        >
          <div>
            <strong>Help improve this tool</strong>
            <p>
              Allow anonymous page and engagement measurement with Google
              Analytics. Your selections and health information are never sent.
            </p>
          </div>
          <div className="analytics-consent-actions">
            <button onClick={() => saveConsent("granted")} type="button">
              Allow analytics
            </button>
            <button
              className="analytics-decline"
              onClick={() => saveConsent("denied")}
              type="button"
            >
              No thanks
            </button>
          </div>
        </aside>
      ) : consent !== "loading" ? (
        <button
          className="analytics-settings"
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          Analytics settings
        </button>
      ) : null}
    </>
  );
}
