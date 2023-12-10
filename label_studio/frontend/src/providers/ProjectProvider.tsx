import { createContext, FC, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { shallowEqualObjects } from 'shallow-equal';
import { isDefined } from '../utils/helpers';
import { useAPI, WrappedResponse } from './ApiProvider';
import { useAppStore } from './AppStoreProvider';
import { useParams } from './RoutesProvider';
import { useLocation } from 'react-router';
//import { useProjectsPermissions } from "./PermissionProvider";
//import { FF_LSDV_E_295, isFF } from "../utils/feature-flags";

type Empty = Record<string, never>

type Context = {
  project: APIProject | Empty,
  fetchProject: (id?: string|number, force?: boolean) => Promise<APIProject | void>,
  updateProject: (fields: APIProject) => Promise<WrappedResponse<APIProject>>,
  invalidateCache: () => void,
}

export const ProjectContext = createContext<Context>({} as Context);
ProjectContext.displayName = 'ProjectContext';

const projectCache = new Map<number, APIProject>();

export const ProjectProvider: FC<any> = memo(({ children }) => {
  const api = useAPI();
  const params = useParams();
  const location = useLocation();
  const { update: updateStore } = useAppStore();
  // @todo use null for missed project data
  const [projectData, setProjectData] = useState<APIProject | Empty>(projectCache.get(+params.id) ?? {});
  //const { fetchProjectPermissions, projectsPermissions } = useProjectsPermissions();


  const fetchProject: Context['fetchProject'] = useCallback(async (id, force = false) => {
    const finalProjectId = +(id ?? params.id);

    if (isNaN(finalProjectId)) return;

    if (!force && projectCache.has(finalProjectId)) {
      setProjectData({ ...projectCache.get(finalProjectId)! });
    }

    const result = await api.callApi<APIProject>('project', {
      params: { pk: finalProjectId },
      errorFilter: () => false,
    });

    // if (isFF(FF_LSDV_E_295) && !projectsPermissions.current?.some(p => p.project === finalProjectId))
    //   await fetchProjectPermissions([finalProjectId]);

    const projectInfo = result as unknown as APIProject;

    if (isDefined(projectInfo) && shallowEqualObjects(projectData, projectInfo) === false) {
      setProjectData(projectInfo);
      updateStore({ project: projectInfo });
      projectCache.set(projectInfo.id, projectInfo);
    }

    return projectInfo;
  }, [params]);

  const updateProject: Context['updateProject'] = useCallback(async (fields: APIProject) => {
    const result = await api.callApi<APIProject>('updateProject', {
      params: {
        pk:projectData.id,
      },
      body: fields,
    });

    if (result.$meta) {
      setProjectData(result as unknown as APIProject);
      updateStore({ project: result });
    }

    return result;
  }, [projectData, setProjectData, updateStore]);

  const invalidateCache = useCallback(() => {
    projectCache.clear();
    setProjectData({});
  }, []);

  const contextValue = useMemo(() => {
    return {
      project: projectData,
      fetchProject,
      updateProject,
      invalidateCache,
    };
  }, [projectData, fetchProject, updateProject, invalidateCache]);

  useEffect(() => {
    if (location.pathname.startsWith(`/projects`)) {
      if (+params.id !== projectData?.id) {
        setProjectData({});
      }
      fetchProject();
    }
  }, [location, params]);

  useEffect(() => {
    return () => projectCache.clear();
  }, []);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
});

// without this extra typing VSCode doesn't see the type after import :(
export const useProject: () => Context = () => {
  return useContext(ProjectContext) ?? {};
};
