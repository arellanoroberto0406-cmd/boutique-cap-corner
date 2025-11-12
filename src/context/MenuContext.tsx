import React, { createContext, useContext, useState } from "react";

interface MenuContextType {
  isBrandsOpen: boolean;
  openBrandsMenu: () => void;
  closeBrandsMenu: () => void;
  toggleBrandsMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  const openBrandsMenu = () => setIsBrandsOpen(true);
  const closeBrandsMenu = () => setIsBrandsOpen(false);
  const toggleBrandsMenu = () => setIsBrandsOpen(prev => !prev);

  return (
    <MenuContext.Provider value={{ isBrandsOpen, openBrandsMenu, closeBrandsMenu, toggleBrandsMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
};
