import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ErrorWrapper } from '../components/Error/Error';
import { modal } from '../components/Modal/Modal';
import { API_CONFIG } from '../config/ApiConfig';
//import { API_CONFIG_LSE } from '../config/ApiConfigLSE';
import { APIProxy } from '../utils/api-proxy';
import { absoluteURL, isDefined } from '../utils/helpers';

Object.assign(
  API_CONFIG.endpoints,
  //API_CONFIG_LSE.endpoints,
);

const API = new APIProxy(API_CONFIG);

let apiLocked = false;

export const ApiContext = createContext();
ApiContext.displayName = 'ApiContext';

const errorFormatter = (result) => {
  const { response } = result;
  // we should not block app because of some network issue
  const isShutdown = false;

  return {
    isShutdown,
    title: result.error ? "Runtime error" : "Server error",
    message: response?.detail ?? result?.error,
    stacktrace: response?.exc_info ?? null,
    version: response?.version,
    validation: Object.entries(response?.validation_errors ?? {}),
  };
};

const handleError = async (response, showModal = true) => {
  let result = response;

  if (result instanceof Response) {
    result = await API.generateError(response);
  }

  const { isShutdown, ...formattedError } = errorFormatter(result);

  if (showModal) {
    modal({
      unique: "network-error",
      allowClose: !isShutdown,
      body: isShutdown ? (
        <ErrorWrapper
          possum={false}
          title={"Connection refused"}
          message={"Server not responding. Is it still running?"}
        />
      ) : (
        <ErrorWrapper {...formattedError}/>
      ),
      simple: true,
      style: { width: 680 },
    });
  }

  return isShutdown;
};

export const ApiProvider = forwardRef(({ children }, ref) => {
  const [error, setError] = useState(null);

  const resetError = () => setError(null);

  const callApi = useCallback(async (method, { params = {}, errorFilter, ...rest } = {}) => {
    if (apiLocked) return;

    setError(null);

    const result = await API[method](params, rest);

    if (result.status === 401) {
      apiLocked = true;
      location.href = absoluteURL("/");
      return;
    }

    if (result.error) {
      const shouldCatchError = !isDefined(errorFilter) || errorFilter(result) === false;

      if (shouldCatchError){
        setError(result);
        const isShutdown = await handleError(result, contextValue.showModal);

        apiLocked = apiLocked || isShutdown;

        return null;
      }
    }

    return result;
  }, []);

  const contextValue = useMemo(() => ({
    api: API,
    callApi,
    handleError,
    resetError,
    error,
    showModal: true,
    errorFormatter,
    isValidMethod(...args) {
      return API.isValidMethod(...args);
    },
  }), [error]);

  useEffect(() => {
    if (ref) {
      ref.current = contextValue;
    }
  }, [ref]);

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
});

export const useAPI = () => {
  return useContext(ApiContext);
};
