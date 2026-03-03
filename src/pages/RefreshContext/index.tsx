import { createContext, useContext, useState } from 'react';

interface RefreshContextType {
  refreshKey: number;
  isAuthenticated: boolean;
  userData: any;
  triggerRefresh: () => void;
  setAuthentication: (isAuthenticated: boolean, userData?: any) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const setAuthentication = (authStatus: boolean, data?: any) => {
    setIsAuthenticated(authStatus);
    setUserData(data || null);
    triggerRefresh();
  };

  return (
    <RefreshContext.Provider value={{ 
      refreshKey, 
      isAuthenticated,
      userData,
      triggerRefresh, 
      setAuthentication 
    }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
}