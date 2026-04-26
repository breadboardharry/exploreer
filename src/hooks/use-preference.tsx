import { PreferenceContext } from "@providers/preference.provider";
import { useContext } from "react";

const usePreference = () => {
  const context = useContext(PreferenceContext);
  if (!context) {
    throw new Error(
      "usePreference doit être utilisé à l'intérieur d'un PreferenceProvider",
    );
  }
  return context;
};

export default usePreference;
