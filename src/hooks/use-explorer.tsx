import { ExplorerContext } from "@providers/explorer.provider";
import { useContext } from "react";

const useExplorer = () => {
  const context = useContext(ExplorerContext);
  if (!context) {
    throw new Error(
      "useExplorer doit être utilisé à l'intérieur d'un ExplorerProvider",
    );
  }
  return context;
};

export default useExplorer;
