import { createContext, FC, useCallback, useContext, useMemo, useState } from "react";

type Store = {
  project: unknown,
  dataset: unknown,
}
type Context = {
  store: Store,
  update: (data: Partial<Store>) => void,
}

const AppStoreContext = createContext<Context>({} as Context);

AppStoreContext.displayName = 'AppStoreContext';

export const AppStoreProvider: FC<any> = ({ children }) => {
  const [store, setStore] = useState({} as Store);

  const update = useCallback((newData: Partial<Store>) => {
    setStore({ ...store, ...(newData ?? {}) });
  }, [store]);

  const contextValue = useMemo(() => ({
    store,
    update,
  }), [store, update]);

  return (
    <AppStoreContext.Provider value={contextValue}>
      {children}
    </AppStoreContext.Provider>
  );
};

export const useAppStore = () => {
  return useContext(AppStoreContext);
};
