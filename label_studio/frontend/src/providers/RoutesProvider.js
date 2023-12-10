import { pathToRegexp } from 'path-to-regexp';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { generatePath, matchPath, useHistory, useLocation } from 'react-router';
import { Pages } from '../pages';
import { clear, setBreadcrumbs, useBreadcrumbControls } from '../services/breadrumbs';
import { arrayClean, isDefined } from '../utils/helpers';
import { pageSetToRoutes } from '../utils/routeHelpers';
import { useAppStore } from './AppStoreProvider';
import { useConfig } from './ConfigProvider';

export const RoutesContext = createContext();

const findMacthingComponents = (path, routesMap, parentPath = "") => {
  const result = [];

  const match = routesMap.find((route) => {
    const matchingPath = `${parentPath}${route.path}`;
    const match = matchPath(path, { path: matchingPath });

    return match;
  });

  if (match) {
    const routePath = `${parentPath}${match.path}`;

    result.push({ ...match, path: routePath });

    if (match.routes) {
      result.push(...findMacthingComponents(path, match.routes, routePath));
    }
  }

  return result;
};

const flattenRoutesMap = (routesMap) => {
  const result = [];

  const collect = (items, parentPath) => {
    items.forEach(item => {
      const { routes, ...rest } = item;
      const path = arrayClean([parentPath, rest.path]).join("");

      result.push({
        ...rest,
        path,
      });

      if (Array.isArray(routes)) {
        collect(routes, path);
      }
    });
  };

  collect(routesMap);

  return result;
};

const extractNamedRoutesFlat = (routesMap) => {
  const namedRoutes = {};

  const collect = (routes, parent = "/") => {
    let i = 0, l = routes.length;

    for(i; i<l; i++) {
      const route = routes[i];
      const path = (`/${parent}/${route.path}`).replace(/([/]+)/ig, '/');
      const name = route.alias;

      if (isDefined(name)) {
        if (Object.prototype.hasOwnProperty.call(namedRoutes, name)) {
          throw Error(`Duplicate route name ${name} [${path}]: ${namedRoutes[name]} already exists`);
        }

        namedRoutes[name] = path;
      }

      if (route.routes) {
        collect(route.routes, path);
      }
    }

    return namedRoutes;
  };

  return collect(routesMap, "/");
};

export const RoutesProvider = ({ children }) => {
  const history = useHistory();
  const location = useLocation();
  const config = useConfig();
  const { store } = useAppStore();
  const breadcrumbs = useBreadcrumbControls();
  const [currentContext, setCurrentContext] = useState(null);
  const [currentContextProps, setCurrentContextProps] = useState(null);

  const routesMap = useMemo(() => {
    return pageSetToRoutes(Pages, { config, store });
  }, [location, config, store, history]);

  const flatRoutesList = useMemo(() => {
    return flattenRoutesMap(routesMap);
  }, [routesMap]);

  const routesChain = useMemo(() => {
    return findMacthingComponents(location.pathname, routesMap);
  }, [location, routesMap]);

  const lastRoute = useMemo(() => {
    return routesChain.filter(r => !r.modal).slice(-1)[0];
  }, [routesChain]);

  const lastContext = useMemo(() => {
    const routes = routesChain.filter(r => !r.modal).reverse();

    return routes.find(r => isDefined(r.context))?.context;
  }, [routesChain]);

  const flatNamedRoutes = useMemo(() => {
    return extractNamedRoutesFlat(routesMap);
  }, [routesMap]);

  const isInternalPath = useCallback((path) => {
    return flatRoutesList.reduce((res, route) => {
      const matched = !!matchPath(path, route);

      return matched || res;
    }, false);
  }, [flatRoutesList]);

  const [currentPath, setCurrentPath] = useState(lastRoute?.path);

  const contextValue = useMemo(() => ({
    routesMap,
    breadcrumbs,
    currentContext,
    isInternalPath,
    routes: flatNamedRoutes,
    setContextProps: setCurrentContextProps,
    path: currentPath,
    findComponent: (path) => findMacthingComponents(path, routesMap),
  }), [
    breadcrumbs,
    routesMap,
    currentContext,
    currentPath,
    setCurrentContext,
    flatNamedRoutes,
    isInternalPath,
  ]);

  useEffect(() => {
    //clear();
    const ContextComponent = lastContext;

    setCurrentContext({
      component: ContextComponent ?? null,
      props: currentContextProps,
    });

    setCurrentPath(lastRoute?.path);

    try {
      // show only first two items
      const crumbs = routesChain.slice(0, 2).map(route => {
        const params = matchPath(location.pathname, { path: route.path });
        const path = generatePath(route.path, params.params);
        const title = route.title instanceof Function ? route.title() : route.title;
        const key = route.component?.displayName ?? route.key ?? path;
        const beta = route.component?.beta ?? false;
        const titleRaw = route.titleRaw;

        return { path, title, key, beta, titleRaw };
      }).filter(c => !!c.title);

      setBreadcrumbs(crumbs);
    } catch (err) {
      console.log(err);
    }
  }, [location, routesMap, currentContextProps, routesChain, lastRoute]);

  return (
    <RoutesContext.Provider value={contextValue}>
      {children}
    </RoutesContext.Provider>
  );
};

export const useRoutesMap = () => {
  return useContext(RoutesContext)?.routesMap ?? [];
};

export const useFindRouteComponent = () => {
  return useContext(RoutesContext)?.findComponent ?? (() => null);
};

export const useBreadcrumbs = () => {
  return useContext(RoutesContext)?.breadcrumbs ?? [];
};

export const useCurrentPath = () => {
  return useContext(RoutesContext)?.path;
};

export const useNavigation = () => {
  const routes = useContext(RoutesContext)?.routes ?? {};
  const history = useHistory();

  const lookupPath = (name) => {
    if (!isDefined(routes[name])) {
      throw new Error(`Undeclared route alias: ${name}`);
    }

    return routes[name];
  };

  return useMemo(() => {
    return {
      generatePath(name, params) {
        const path = lookupPath(name);
        const keys = [];

        pathToRegexp(path, keys);

        const names = keys.map(ent => ent.name);
        const queryParams = Object.fromEntries(Object.entries(params ?? {}).filter((p) => {
          return !names.includes(p[0]);
        }));

        try {
          const resultPath = generatePath(path, params);
          const searchParams = new URLSearchParams(queryParams);

          return resultPath + (searchParams ? `?${searchParams}` : '');
        } catch (err) {
          throw new Error(`Failed to generate path for ${name} [${path}]: ${err.message}`);
        }
      },
      go(name, params) {
        history.push(this.generatePath(name, params));
      },
      replace(name, params) {
        history.replace(this.generatePath(name, params));
      },
    };
  }, [history, routes]);
};

export const useParams = () => {
  const location = useLocation();
  const currentPath = useCurrentPath();

  const match = useMemo(() => {
    const search = Object.fromEntries(location.search
      .replace(/^\?/, '')
      .split("&")
      .map(pair => {
        const [key, value] = pair.split('=').map(p => decodeURIComponent(p));

        return [key, value];
      }));

    const urlParams = matchPath(location.pathname, currentPath ?? "");

    return { ...search, ...(urlParams?.params ?? {}) };
  }, [location, currentPath]);

  return match ?? {};
};

export const useContextComponent = () => {
  const ctx = useContext(RoutesContext);
  const {
    component: ContextComponent,
    props: contextProps,
  } = ctx?.currentContext ?? {};

  return { ContextComponent, contextProps };
};

export const useContextProps = () => {
  const setProps = useContext(RoutesContext).setContextProps;

  return useMemo(() => setProps, [setProps]);
};

export const useFixedLocation = () => {
  const location = useLocation();

  const result = useMemo(() => {
    return location.location ?? location;
  }, [location]);

  return result;
};

export const useRoutes = () => {
  return useContext(RoutesContext) ?? {};
};
