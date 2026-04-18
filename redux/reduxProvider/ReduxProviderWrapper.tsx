"use client";

import React from "react";
import { Provider } from "react-redux";
import { persistor, store } from "../store";
import { PersistGate } from "redux-persist/integration/react";

const ReduxProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Provider store={store}>
      {mounted ? (
        <PersistGate 
          loading={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          } 
          persistor={persistor}
        >
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
};

export default ReduxProviderWrapper;
