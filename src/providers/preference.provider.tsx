import { createContext, ReactNode, useState } from "react";

export interface PreferenceContextType {
  showTags: boolean;
  setShowTags: (show: boolean) => void;
}

export const PreferenceContext = createContext<
  PreferenceContextType | undefined
>(undefined);

interface PreferenceProviderProps {
  children: ReactNode;
}
const PreferenceProvider: React.FC<PreferenceProviderProps> = ({
  children,
}) => {
  const [showTags, setShowTags] = useState(true);

  return (
    <PreferenceContext.Provider value={{ showTags, setShowTags }}>
      {children}
    </PreferenceContext.Provider>
  );
};

export default PreferenceProvider;
