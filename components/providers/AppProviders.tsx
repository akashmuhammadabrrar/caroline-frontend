"use client";

import React from "react";
import ReduxProviderWrapper from "@/redux/reduxProvider/ReduxProviderWrapper";
import { DynamicConfigProvider } from "./DynamicConfigProvider";
import { NotificationProvider } from "./NotificationProvider";
import { Toaster } from "react-hot-toast";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ReduxProviderWrapper>
      <DynamicConfigProvider>
        <NotificationProvider>
          {children}
          {mounted && <Toaster position="top-right" />}
        </NotificationProvider>
      </DynamicConfigProvider>
    </ReduxProviderWrapper>
  );
};
