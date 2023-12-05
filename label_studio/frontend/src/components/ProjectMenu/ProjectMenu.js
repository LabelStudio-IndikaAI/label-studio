import React, { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { useProject } from "../../providers/ProjectProvider";
import { Block, Elem } from "../../utils/bem";
import "./ProjectMenu.styl";

export const ProjectMenu = () => {
  const { project } = useProject();
  const links = useMemo(() => {
    const result = {
      '/data': { label: 'Data Manager' },
    };

    return result;
  }, [project]);

  if (project?.id === undefined ) return null;

  return (
    <Block name="project-menu">
      {Object.entries(links).map(([path, options], i) => {
        return (
          <MenuItem
            key={`${path}-${i}`}
            path={path}
            project={project}
            {...options}
          />
        );
      })}
    </Block>
  );
};

const MenuItem = ({ path, access, exact, project, label }) => {
  const elem = (
    <Button 
      tag={NavLink}
      exact={exact ?? true}
      to={`/projects/${project.id}${path}`}
      data-external
      size="medium"
    >
      {label}
    </Button>
  );

  const result = useMemo(() => {
    if (access === false) {
      return elem;
    } else {
      return (
        <div key={path} fallback={null}>
          { elem }
        </div>
      );
    }
  }, [access, path]);

  return result;
};
