import React, { createContext, useContext, useState, useEffect } from 'react';
import { tenantService } from '../services/TenantService';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [currentTenant, setCurrentTenant] = useState(tenantService.getCurrentTenant());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize tenant data
    const tenant = tenantService.getCurrentTenant();
    if (tenant) {
      setCurrentTenant(tenant);
    }
    setIsLoading(false);
  }, []);

  const value = {
    currentTenant,
    setCurrentTenant: (tenant) => {
      tenantService.setTenant(tenant);
      setCurrentTenant(tenant);
    },
    isLoading
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}; 