import React, { useRef, useState } from 'react';
import { useParams as useRouterParams } from 'react-router';
import { Redirect } from 'react-router-dom';
import { Button } from '../../components';
import { Oneof } from '../../components/Oneof/Oneof';
import { Spinner } from '../../components/Spinner/Spinner';

import { ApiContext } from '../../providers/ApiProvider';
import { useContextProps } from '../../providers/RoutesProvider';
import { useAbortController } from "../../hooks/useAbortController";
import { Block, Elem } from '../../utils/bem';
import { FF_DEV_2575, isFF } from '../../utils/feature-flags';
import { CreateProject } from '../CreateProject/CreateProject';
import { DataManagerPage } from '../DataManager/DataManager';
import { SettingsPage } from '../Settings';
import './Projects.styl';
import { EmptyProjectsList, EmptySearchList, ProjectsList } from './ProjectsList';
import { FaSearch, FaTimes } from 'react-icons/fa';




const getCurrentPage = () => {
  const pageNumberFromURL = new URLSearchParams(location.search).get("page");

  return pageNumberFromURL ? parseInt(pageNumberFromURL) : 1;
};

export const ProjectsPage = () => {
  const api = React.useContext(ApiContext);
  const abortController = useAbortController();
  const [projectsList, setProjectsList] = React.useState([]);
  const [networkState, setNetworkState] = React.useState(null);
  const [currentPage, setCurrentPage] = useState(getCurrentPage());
  const [totalItems, setTotalItems] = useState(1);
  const setContextProps = useContextProps();
  //const defaultPageSize = parseInt(localStorage.getItem('pages:projects-list') ?? 10);
  const defaultPageSize = 10;
  const [modal, setModal] = React.useState(false);
  const openModal = setModal.bind(null, true);
  const closeModal = setModal.bind(null, false);
  const [searchQuery, setSearchQuery] = useState('');
  // const [recentSearches, setRecentSearches] = useState([]);
  // const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Function to update recent searches
  // const updateRecentSearches = (query) => {
  //   const updatedSearches = [query, ...recentSearches.filter((search) => search !== query)].slice(0, 3);

  //   setRecentSearches(updatedSearches);
  // };





  const fetchProjects = async () => {
    setNetworkState('loading');
    abortController.renew(); // Cancel any in flight requests

    const requestParams = {
      page: 1,
      page_size: 9999,
    };

    if (isFF(FF_DEV_2575)) {
      requestParams.include = [
        'id',
        'title',
        'created_by',
        'created_at',
        'color',
        'is_published',
        'assignment_settings',
      ].join(',');
    }

    const data = await api.callApi("projects", {
      params: requestParams,
      ...(isFF(FF_DEV_2575) ? {
        signal: abortController.controller.current.signal,
        errorFilter: (e) => e.error.includes('aborted'),
      } : null),
    });

    setTotalItems(data?.count ?? 1);
    setProjectsList(data.results ?? []);
    setNetworkState('loaded');

    if (isFF(FF_DEV_2575) && data?.results?.length) {
      const additionalData = await api.callApi("projects", {
        params: {
          ids: data?.results?.map(({ id }) => id).join(','),
          include: [
            'id',
            'description',
            'num_tasks_with_annotations',
            'task_number',
            'skipped_annotations_number',
            'total_annotations_number',
            'total_predictions_number',
            'ground_truth_number',
            'finished_task_number',
          ].join(','),
          page_size: data.count,
        },
        signal: abortController.controller.current.signal,
        errorFilter: (e) => e.error.includes('aborted'),
      });

      if (additionalData?.results?.length) {
        setProjectsList(prev =>
          additionalData.results.map((project) => {
            const prevProject = prev.find(({ id }) => id === project.id);

            return {
              ...prevProject,
              ...project,
            };
          }),
        );
      }
    }
  };




  const loadNextPage = async (page, pageSize) => {
    setCurrentPage(page);
    await fetchProjects(page, pageSize);
  };

  // Filter projects based on the search query
  const filteredProjects = projectsList.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  React.useEffect(() => {
    fetchProjects();
  }, []);

  React.useEffect(() => {
    // there is a nice page with Create button when list is empty
    // so don't show the context button in that case
    setContextProps({ openModal, showButton: projectsList.length > 0, searchQuery, setSearchQuery });
  }, [projectsList.length, searchQuery, setSearchQuery]);

  const pageTitle = "Create a New Projects";
  const pageDescription = "Set up tasks and import photos, videos, text, and audio to annotate";
  const showCreateButton = !searchQuery && projectsList.length > 0;

  return (
    <Block name="projects-page">
      <Oneof value={networkState}>
        <Elem name="loading" case="loading">
          <Spinner size={64} />
          {/* <Spinner  /> */}
        </Elem>
        <Elem name="content" case="loaded">

          {/* {isSearchFocused && (
            <div className={`recent-searches-box popup-container ${recentSearches.length === 0 ? 'active' : ''}`}>
              <h4>Recent Searches</h4>
              {recentSearches.length === 0 ? (
                <div>No searches were found</div>
              ) : (
                recentSearches.map((recentSearch, index) => (
                  <div key={index} className="recent-search-item">
                    {recentSearch}
                  </div>
                ))
              )}
            </div>
          )} */}

          {/* Title */}
          {showCreateButton && (
            <Elem name="title-container">
              <Elem name="title-info">
                <h3>{pageTitle}</h3>
                <p>{pageDescription}</p>
              </Elem>

              <Elem name="create-project-button">
                <Button onClick={openModal} look="primary" size="compact">
                  + Create Project
                </Button>
              </Elem>

            </Elem>
          )}


          {/* Projects List Container */}
          <Elem name="projects-list-container">
            {searchQuery && (
              <Elem name="search-query-result">
                <h3>All Projects {'>'} <span>Search Results</span></h3>
              </Elem>
            )}
            {filteredProjects.length ? (
              <ProjectsList
                projects={filteredProjects}
                currentPage={currentPage}
                totalItems={totalItems}
                loadNextPage={loadNextPage}
                pageSize={defaultPageSize}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            ) : (
              projectsList.length === 0 ? (
                // Display EmptyProjectsList if there are no projects
                <EmptyProjectsList openModal={openModal} />
              ) : (
                // Display EmptySearchList if there are projects but no matching search results
                <EmptySearchList
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              )
            )}
          </Elem>
          {modal && <CreateProject onClose={closeModal} />}
        </Elem>
      </Oneof>
    </Block>
  );
};

ProjectsPage.context = ({ showButton, searchQuery, setSearchQuery }) => {
  if (!showButton) return null;
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const updateRecentSearches = (query) => {
    const updatedSearches = [query, ...recentSearches.filter((search) => search !== query)].slice(0, 3);

    setRecentSearches(updatedSearches);
  };

  const RecentSearchDropdown = ({ recentSearches, onSelect }) => {
    return (
      <div className="recent-searches-dropdown">
        <h4>Recent Searches</h4>
        {recentSearches.map((recentSearch, index) => (
          <div key={index} className="recent-search-item" onClick={() => onSelect(recentSearch)}>
            {recentSearch}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="context-area" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* Search Box */}
      <div className="search-box" style={{ position: 'relative', width: '500px', marginRight: '100px' }}>
        <div style={{ position: 'absolute', left: '10px', top: '58%', transform: 'translateY(-50%)' }}>
          <FaSearch style={{ color: '#999', fontSize: '1.2rem' }} />
        </div>
        <input
          className='input-context'
          id='search-input'
          type="text"
          placeholder="Search..."
          style={{
            width: '100%',
            borderRadius: '5px',
            padding: '6px', 
            paddingLeft: '40px',
            fontSize: '1rem',
            lineHeight: '1.2',
            backgroundColor: '#f6f6f6',
          }}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateRecentSearches(e.target.value);
            }
          }}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />

        {/* Conditionally render the clear input button */}
        {searchQuery && (
          <button
            className="clear-input-button"
            onClick={() => setSearchQuery('')} // Clear the input when clicked
            style={{
              position: 'absolute',
              top: '50%',
              right: '-50px',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <FaTimes />
          </button>
        )}
      </div>
      {isSearchFocused && recentSearches.length > 0 && (
        <div className="recent-searches-box" style={{
          position: 'absolute',
          top: '100%',
          width: '550px',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '5px',
          marginTop: '1px',
          marginRight: '50px',
          padding: '2px',
        }}>
          <h4 style={{ margin: '0 0 0px', padding: '1px' }}>Recent Searches</h4>
          {recentSearches.map((recentSearch, index) => (
            <div key={index} className="recent-search-item" style={{ padding: '5px', cursor: 'pointer' }}
              onClick={() => {
                setSearchQuery(recentSearch);
                setIsSearchFocused(false);
              }}
            >
              {recentSearch}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};



ProjectsPage.path = "/projects";
ProjectsPage.exact = true;
ProjectsPage.routes = ({ store }) => [
  {
    //title: store.project?.title,
    // set the title to empty string to remove the route title from the page
    title: "",
    path: "/:id(\\d+)",
    exact: true,
    component: () => {
      const params = useRouterParams();


      return (
        <>
          <Redirect to={`/projects/${params.id}/data`} />
        </>
      );
    },
    pages: {
      DataManagerPage,
      SettingsPage,
    },
  },
];

