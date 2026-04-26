import { HistoryContext } from "@providers/history.provider";
import { useContext } from "react";

const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error(
      "useHistory doit être utilisé à l'intérieur d'un HistoryProvider",
    );
  }
  return context;
};

export default useHistory;
