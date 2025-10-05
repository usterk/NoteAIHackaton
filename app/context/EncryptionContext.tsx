'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface EncryptionContextType {
  encryptionKey: CryptoKey | null;
  setEncryptionKey: (key: CryptoKey | null) => void;
  clearEncryptionKey: () => void;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: ReactNode }) {
  const [encryptionKey, setEncryptionKeyState] = useState<CryptoKey | null>(null);

  const setEncryptionKey = (key: CryptoKey | null) => {
    setEncryptionKeyState(key);
    if (key) {
      sessionStorage.setItem('hasEncryptionKey', 'true');
    }
  };

  const clearEncryptionKey = () => {
    setEncryptionKeyState(null);
    sessionStorage.removeItem('hasEncryptionKey');
  };

  return (
    <EncryptionContext.Provider value={{ encryptionKey, setEncryptionKey, clearEncryptionKey }}>
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryption() {
  const context = useContext(EncryptionContext);
  if (context === undefined) {
    throw new Error('useEncryption must be used within EncryptionProvider');
  }
  return context;
}
