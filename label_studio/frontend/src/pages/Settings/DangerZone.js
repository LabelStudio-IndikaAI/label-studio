import { useMemo, useState,useEffect } from "react";
import { useHistory } from "react-router";
import { Button } from "../../components";
import { ProjectMenu } from "../../components/ProjectMenu/ProjectMenu";
import { Description } from "../../components/Description/Description";
import { Label } from "../../components/Form";
import { confirm } from "../../components/Modal/Modal";
import { Space } from "../../components/Space/Space";
import { Spinner } from "../../components/Spinner/Spinner";
import { useAPI } from "../../providers/ApiProvider";
import { useProject } from "../../providers/ProjectProvider";
import { MdInfo } from "react-icons/md";
import { useConfig } from '../../providers/ConfigProvider';
import { UserInfo } from "../../components/Userpic/UserInfo";


export const DangerZone = () => {
  const { project } = useProject();
  const api = useAPI();
  const history = useHistory();
  // const currentUser = useCurrentUser();
  const [processing, setProcessing] = useState(null);
  const currentUser = useConfig();
  const [isCreator, setIsCreator] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  // const currentUserId = currentUser?.user?.id ?? null;
  // const projectCreatorId = project.created_by;
  // const projectIDs = project?.created_by?.id ?? null;
  // const projectIDs = project.created_by.id;
  // const currentUserId = currentUser.user.id;
  // const isCreator = currentUserId === projectIDs;
  // const [isCreator, setIsCreator] = useState(false);
  // const [isPublic, setIsPublic] = useState(project?.is_public ?? false);
  // console.log('DangerZone projectCreatorId:', projectCreatorId);
  // console.log('DangerZone currentUserId:', currentUserId);
  // console.log('DangerZone currentUser:', currentUser);
  // // const isCurrentUserCreator = project.created_by.id === currentUser;
  // console.log('isCurrentUserCreator:', project.created_by);
  // console.log('isCurrentUserCreator:', projectIDs);

  // useEffect(() => {
  //   if (project && currentUser?.user) {
  //     setIsPublic(project.is_public);
  //     setIsCreator(currentUserId === projectIDs);
  //     setIsLoading(false);
  //   }
  // }, [currentUser, project]);
  // useEffect(() => {
  //   if (project && currentUser?.user) {
  //       setIsPublic(project.is_public);
  //       setIsCreator(currentUser.user.id === project.created_by?.id);
  //   }
  // }, [project, currentUser]);

  if (!project || !currentUser?.user) {
    return <Spinner size={32} />;
}

  const handleOnClick = (type) => () => {
    confirm({
      title: "Action confirmation",
      body: "You're about to delete all things. This action cannot be undone.",
      okText: "Proceed",
      buttonLook: "destructive",
      onOk: async () => {
        setProcessing(type);
        if (type === 'annotations') {
          // console.log('delete annotations');
        } else if (type === 'tasks') {
          // console.log('delete tasks');
        } else if (type === 'predictions') {
          // console.log('delete predictions');
        } else if (type === 'tabs') {
          await api.callApi('deleteTabs', {
            body: {
              project: project.id,
            },
          });
        } else if (type === 'project') {
          await api.callApi('deleteProject', {
            params: {
              pk: project.id,
            },
          });
          history.replace('/projects');
        }
        setProcessing(null);
      },
    });
  };
  
  
  
  const toggleVisibility = async () => {
    // if (!isCreator) return;
    setProcessing(true);
    try {
      await api.callApi('updateProject', {
        params: { pk: project?.id },
        body: { is_public: !isPublic },
      });
      setIsPublic(!isPublic); // Update the local state to reflect the change
    } catch (error) {
      console.error('Error updating project visibility:', error);
    }
    setProcessing(false);
  };
  
  // if (isLoading) {
  //   return <Spinner size={32} />; // Or any other loading indicator you prefer
  // }

  const cardStyle = {
    width: '45%',
    margin: 'auto',
    backgroundColor: '#f6f6f6',
    border: '1px solid #D1D3D6',
    marginBottom: '10px'
  };
  
  const headerStyle = {
    background: '#E6E6E6',
    color: '#616161',
    padding: '5px 10px',
    textAlign: 'start'
  };
  
  const contentStyle = {
    padding: '10px',
    textAlign: 'start'
  };

  // return (
  //   <div style={{ /* styling code */ }}>
  //     {/* ... existing cards ... */}

  //     {/* Visibility Toggle Card */}
  //     <div style={{ /* card styling code */ }}>
  //       <Description>
  //         <div style={{ /* styling code */ }}>
  //           <p style={{ /* styling code */ }}>
  //             <MdInfo size={18} />Toggle project visibility between public and private.
  //           </p>
  //         </div>
  //       </Description>
  //       <div style={{ /* styling code */ }}>
  //         <div style={{ /* styling code */ }}>
  //           Project Visibility
  //         </div>
  //         <div style={{ /* styling code */ }}>
  //           {isPublic ? "This project is currently public." : "This project is currently private."}
  //           <Button onClick={toggleVisibility} look="primary">
  //             {isPublic ? "Make Private" : "Make Public"}
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );


  const buttons = useMemo(() => [{
    type: 'annotations',
    disabled: true, //&& !project.total_annotations_number,
    label: `Delete ${project.total_annotations_number} Annotations`,
  }, {
    type: 'tasks',
    disabled: true, //&& !project.task_number,
    label: `Delete ${project.task_number} Tasks`,
  }, {
    type: 'predictions',
    disabled: true, //&& !project.total_predictions_number,
    label: `Delete ${project.total_predictions_number} Predictions`,
  }, {
    type: 'tabs',
    label: `Drop`,
  }, {
    type: 'project',
    label: 'Delete Project',
  }], [project]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '95%',
      display: 'flex',
      margin: 'auto',
      marginBottom: '20px',
      //backgroundColor: '#f6f6f6',
      //border: '1px solid #f6f6f6',
      padding: '20px',
      borderRadius: '5px',
      //boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      color: 'rgb(51, 51, 51)',
      fontSize: '16px',
    }}>
      <div style={{ width: '45%', margin: 'auto', backgroundColor: '#f6f6f6', border: '1px solid #D1D3D6', marginBottom: '10px' }}>
        <Description>
          <div style={{
            padding: '3px',
            width: '95%',
            color: '#D72C0D',
            backgroundColor: '#FFF6F4',
            fontSize: '12px',
            boxSizing: 'border-box',
            borderRadius: '20px',
            boxShadow: '0px 0px 0px 0px',
            margin: 'auto',

          }}>
            <p style={{ display: 'flex', alignItems: 'center', margin: 'auto', gap: '5px', lineHeight: '1rem' }}><MdInfo size={18} />Dropping all tabs cannot be reverted. Perform this action at your own risk.</p>
          </div>
        </Description>
        <UserInfo user={currentUser.user} />
        <div style={{ width: '95%', margin: '10px auto', border: '1px solid #D1D3D6' }}>
          <div style={{ background: '#E6E6E6', color: '#616161', padding: '5px 10px', textAlign: 'start' }}>
            Drop all tabs
          </div>
          <div style={{ padding: '10px', textAlign: 'start' }}>
            <div>
              Are you sure you want to drop all tabs?
            </div>
            {project.id  ? (
              // isCurrentUserCreator &&
              <Space direction="vertical" spread style={{ marginTop: 32, display: 'flex' }}>
                {buttons.filter(btn => btn.type === 'tabs').map((btn) => {
                  const waiting = processing === btn.type;
                  const disabled = btn.disabled || (processing && !waiting);

                  return (
                    <Button key={btn.type} look="danger" disabled={disabled} waiting={waiting} onClick={handleOnClick(btn.type)}>
                      {btn.label}
                    </Button>
                  );
                })}
              </Space>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                <Spinner size={32} />
                {/* <Spinner /> */}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ width: '45%', margin: 'auto', backgroundColor: '#f6f6f6', border: '1px solid #D1D3D6', marginBottom: '10px' }}>
        <Description>
          <div style={{
            padding: '3px',
            width: '95%',
            color: '#D72C0D',
            backgroundColor: '#FFF6F4',
            fontSize: '12px',
            boxSizing: 'border-box',
            borderRadius: '20px',
            boxShadow: '0px 0px 0px 0px',
            margin: 'auto',

          }}>
            <p style={{ display: 'flex', alignItems: 'center', margin: 'auto', gap: '5px', lineHeight: '1rem' }}><MdInfo size={18} />Deleting a project can not be reverted. Make sure your data is backed up.</p>
          </div>
        </Description>
        <div style={{ width: '95%', margin: '10px auto', border: '1px solid #D1D3D6' }}>
          <div style={{ background: '#E6E6E6', color: '#616161', padding: '5px 10px', textAlign: 'start' }}>
            Delete this project
          </div>
          <div style={{ padding: '10px', textAlign: 'start' }}>
            <div>
              Are you sure you want to delete this project and all its data?
            </div>
            {project.id ? (
              <Space direction="vertical" spread style={{ marginTop: 32, display: 'flex' }}>
                {buttons.filter(btn => btn.type === 'project').map((btn) => {
                  const waiting = processing === btn.type;
                  const disabled = btn.disabled || (processing && !waiting);

                  return (
                    <Button key={btn.type} look="danger" disabled={disabled} waiting={waiting} onClick={handleOnClick(btn.type)}>
                      {btn.label}
                    </Button>
                  );
                })}
              </Space>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
                <Spinner size={32} />
                {/* <Spinner /> */}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Visibility Toggle Card */}
      {project.id  ? (
        <div style={cardStyle}>
          <Description>
            <div style={{ padding: '3px', width: '95%', color: '#D72C0D', backgroundColor: '#FFF6F4', fontSize: '12px', margin: 'auto' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MdInfo size={18} />Toggle project visibility between public and private.</p>
            </div>
          </Description>
          <div style={contentStyle}>
            <div style={headerStyle}>
              Project Visibility
            </div>
            <div>
              {isPublic ? "This project is currently public." : "This project is currently private."}
              <Space direction="vertical" spread style={{ marginTop: 32, display: 'flex' }}>
                <Button onClick={toggleVisibility} look="primary" disabled={processing}>
                  {isPublic ? "Make Private" : "Make Public"}
                </Button>
              </Space>
            </div>
          </div>
        </div>
        ) : (
          //give message that user is not creator
          <div style={cardStyle}>
            <Description>
              <div style={{ padding: '3px', width: '95%', color: '#D72C0D', backgroundColor: '#FFF6F4', fontSize: '12px', margin: 'auto' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MdInfo size={18} />Toggle project visibility between public and private.</p>
              </div>
            </Description>
            <div style={contentStyle}>
              <div style={headerStyle}>
                Project Visibility
              </div>
              <div>
                <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MdInfo size={18} />Only the creator of this project can change the visibility.</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

DangerZone.title = "Manage Project";
DangerZone.context = ProjectMenu;
DangerZone.path = "/danger-zone";
