import chr from 'chroma-js';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { annotation, ban, IconDone, IconTime, LsCheck, LsEllipsis, LsMinus, spark } from '../../assets/icons';
import { Button, Dropdown, Menu, Pagination, Userpic } from '../../components';
import { Block, Elem } from '../../utils/bem';
import { absoluteURL } from '../../utils/helpers';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { Tooltip } from '../../components/Tooltip/Tooltip';

export const ProjectsList = ({ projects, currentPage, totalItems, totalPages, loadNextPage, pageSize, searchQuery, setSearchQuery }) => {

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Slice the projects array to display only the projects for the current page
  const visibleProjects = projects.slice(startIndex, endIndex);

  return (
    <>
      <Elem name="projects-container">
        {searchQuery && (
          <Elem name="search-query">
            <button className="clear-button" onClick={() => setSearchQuery('')} style={{
              border: '1px solid #1a73e8',
              backgroundColor: 'white',
              color: '#1a73e8',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
            }}>
              <span className="back-icon" style={{ marginRight: '5px' }}><IoMdArrowRoundBack /></span> Back to All Projects
            </button>
            <h3>Search For "{searchQuery}"</h3>
          </Elem>
        )}
        <Elem name="list">
          {visibleProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Elem>
        <Elem name="pages">
          <Pagination
            name="projects-list"
            //label="Projects"
            page={currentPage}
            totalItems={totalItems}
            urlParamName="page"
            pageSize={pageSize}
            //pageSizeOptions={[10, 30, 50, 100]}
            onPageLoad={(page, pageSize) => loadNextPage(page, pageSize)}
            totalPages={totalPages}
            customRender={() => (
              <div className="project-container">
                <div className="project-list">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
                <div className="pagination-container">
                  <button
                    className="pagination-button"
                    onClick={() => loadNextPage(1)}
                    disabled={currentPage === 1}
                  >
                    &lt;&lt;
                  </button>
                  <button
                    className="pagination-button"
                    onClick={() => loadNextPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>
                  <span className="pagination-text">
                    {currentPage} of {totalPages} page
                  </span>
                  <button
                    className="pagination-button"
                    onClick={() => loadNextPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                  <button
                    className="pagination-button"
                    onClick={() => loadNextPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;&gt;
                  </button>
                </div>
              </div>
            )}

          />
        </Elem>
      </Elem >
    </>
  );
};

export const EmptyProjectsList = ({ openModal }) => {
  return (
    <Block name="empty-projects-page">
      <Elem name="heidi" tag="img" src={absoluteURL("/static/icons/slack.jpg")} />
      <Elem name="header" tag="h1">Data Studio doesn’t see any projects here</Elem>
      <p>Create one and start labeling your data</p>
      <Elem name="action" tag={Button} onClick={openModal} look="primary">Create New Project</Elem>
    </Block>
  );
};

export const EmptySearchList = ({ searchQuery, setSearchQuery }) => {
  return (
    <Block name="empty-search-page">
      {searchQuery && (
        <Elem name="search-query">
          <button className="clear-button" onClick={() => setSearchQuery('')} style={{
            border: '1px solid #1a73e8',
            backgroundColor: 'white',
            color: '#1a73e8',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            margin: '8px',
          }}>
            <span className="back-icon" style={{ marginRight: '5px' }}><IoMdArrowRoundBack /></span> Back to All Projects
          </button>
          <h3>Search For "{searchQuery}"</h3>
        </Elem>
      )}
      <Elem name="error404" tag="img" src={absoluteURL("/static/icons/slack.svg")} />
      <Elem name="header" tag="p">Nothing found for the query "{searchQuery}". Please try again with another search query.</Elem>

    </Block>
  );
};



const ProjectCard = ({ project }) => {
  // const isContributor = project.contributors.some(contributor => contributor.id === currentUser.id);
  const projectStatus = project.is_public ? "Public" : "Private";
  console.log({ projectStatus,p:project,projectISpublic:project.is_public });
  // const progress = useMemo(() => {
  //   return project.task_number > 0 ? (project.finished_task_number / project.task_number * 100).toFixed(0) : 0;
  // }, [project]);

  // const headerStyle = useMemo(() => {
  //   const backgroundColor = progress < 50 ? 'lightcoral' : progress < 75 ? 'lightyellow' : 'lightgreen';

  //   return {
  //     background: `linear-gradient(to right, ${backgroundColor} ${progress}%, transparent ${progress}%)`,
  //   };
  // }, [progress]);


  const color = useMemo(() => {
    return project.color === '#FFFFFF' ? null : project.color;
  }, [project]);

  const projectColors = useMemo(() => {
    return color ? {
      '--header-color': color,
      '--background-color': chr(color).alpha(0.2).css(),
    } : {};
  }, [color]);

  return (
    <Elem tag={NavLink} name="link" to={`/projects/${project.id}/data`} data-external>
      <Block name="project-card" mod={{ colored: !!color }} style={projectColors}>
        <Elem name="header">
          {/* <Elem name="header" style={headerStyle}> */}
          <Elem name="title">
            {/* {isContributor && <Elem name="contributor-badge">Contributor</Elem>} */}
            <Elem name="title-text">
              {/* {project.title ?? "New project"}.{progress}% */}
              {project.title ?? "New project"}
            </Elem>
            <Elem name="title-created-by">
              <Userpic src="#" user={project.created_by} showUsername />
            </Elem>
          </Elem>
          <Elem name="description">
            {project.description}
          </Elem>
          <Elem name="status">
          {projectStatus}
          </Elem>
        </Elem>
        <Elem name="info">
          <Elem name="summary">
            <Elem name="annotation">
              <Elem name="total">
                <IconDone />{project.finished_task_number} of {project.task_number} tasks completed
              </Elem>
              <Elem name="detail">
                <Tooltip title="Annotation">
                  <Elem name="detail-item" mod={{ type: "completed" }}>
                    <Elem tag={annotation} name="icon" />
                    {project.total_annotations_number}
                  </Elem>
                </Tooltip>
                <Tooltip title="Skipped">
                  <Elem name="detail-item" mod={{ type: "rejected" }}>
                    <Elem tag={ban} name="icon" />
                    {project.skipped_annotations_number}
                  </Elem>
                </Tooltip>
                <Tooltip title="Predictions">
                  <Elem name="detail-item" mod={{ type: "predictions" }}>
                    <Elem tag={spark} name="icon" />
                    {project.total_predictions_number}
                  </Elem>
                </Tooltip>
                <Elem name="menu" onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}>
                  <Dropdown.Trigger content={(
                    <Menu>
                      <Menu.Item href={`/projects/${project.id}/settings`}>Settings</Menu.Item>
                      <Menu.Item href={`/projects/${project.id}/data?labeling=1`}>Label</Menu.Item>
                    </Menu>
                  )}>
                    <Button size="large" type="text" icon={<LsEllipsis />} />
                  </Dropdown.Trigger>
                </Elem>
              </Elem>

            </Elem>
            <Elem name="created-date">
              <IconTime />{format(new Date(project.created_at), "dd/MM/yyyy 'at' HH:mm")}
            </Elem>
          </Elem>
        </Elem>
      </Block>
    </Elem>

  );
};
