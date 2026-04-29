import { createContext, ReactNode, useState } from "react";

export interface PreferenceContextType {
  showTags: boolean;
  setShowTags: (show: boolean | ((prev: boolean) => boolean)) => void;
  showDetails: boolean;
  setShowDetails: (show: boolean | ((prev: boolean) => boolean)) => void;
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
  const [showDetails, setShowDetails] = useState(true);

  return (
    <PreferenceContext.Provider
      value={{ showTags, setShowTags, showDetails, setShowDetails }}
    >
      {children}
    </PreferenceContext.Provider>
  );
};

export default PreferenceProvider;
