import React from 'react';
import { useHistory } from 'react-router';
import { Button, ToggleItems } from '../../components';
import { Modal } from '../../components/Modal/Modal';
import { Space } from '../../components/Space/Space';
import { HeidiTips } from '../../components/HeidiTips/HeidiTips';
import { useAPI } from '../../providers/ApiProvider';
import { cn } from '../../utils/bem';
import { ConfigPage } from './Config/Config';
import "./CreateProject.styl";
import { ImportPage } from './Import/Import';
import { useImportPage } from './Import/useImportPage';
import { useDraftProject } from './utils/useDraftProject';
import { Select } from '../../components/Form';
import { EnterpriseBadge } from '../../components/Badges/Enterprise';
import { Caption } from '../../components/Caption/Caption';
import { FF_LSDV_E_297, isFF } from '../../utils/feature-flags';
import { createURL } from '../../components/HeidiTips/utils';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { IconDelete, IconSave, IconTick, IconWarning } from '../../assets/icons';



const ProjectName = ({ name, setName, onSaveName, onSubmit, error, description, setDescription, show = true, onNext }) => !show ? null : (
  <form className={cn("project-name")} onSubmit={e => { e.preventDefault(); onSubmit(); }}>
    <div className="field field--wide">
      <label htmlFor="project_name">Project Name</label>
      <input name="name" id="project_name" value={name} onChange={e => setName(e.target.value)} onBlur={onSaveName} />
      {error && <span className="error">{error}</span>}
    </div>
    <div className="field field--wide">
      <label htmlFor="project_description">Projet Description (Optional)</label>
      <textarea
        name="description"
        id="project_description"
        placeholder="Optional description of your project"
        rows="4"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
    </div>
  </form>
);
// const ProjectName = ({ name, setName, onSaveName, onSubmit, error, description, setDescription, show = true, onNext }) => {
//   const handleNext = () => {
//     // Perform validation for unique and non-empty project name
//     if (name.trim() === '') {
//       setError('Project name cannot be empty.');
//     } else if (name === ) {
//       setError('Project name must be unique.');
//   } else {
//     // Validation passed, move to the next step
//     setError(null); // Clear any previous error
//   onNext();
// }
//   };

// const handleSaveName = async () => {
//   // Perform validation for non-empty project name
//   if (name.trim() === '') {
//     setError('Project name cannot be empty.');
//   } else if (name === ) {
//     setError('Project name must be unique.');
// } else {
//   // Validation passed, save the project name
//   setError(null); // Clear any previous error
// await onSaveName();
//     }
//   };

// return !show ? null : (
//   <form className={cn("project-name")} onSubmit={e => { e.preventDefault(); onSubmit(); }}>
//     <div className="field field--wide">
//       <label htmlFor="project_name">Project Name</label>
//       <input name="name" id="project_name" value={name} onChange={e => setName(e.target.value)} onBlur={onSaveName} />
//       {error && <span className="error">{error}</span>}
//     </div>
//     <div className="field field--wide">
//       <label htmlFor="project_description">Projet Description (Optional)</label>
//       <textarea
//         name="description"
//         id="project_description"
//         placeholder="Optional description of your project"
//         rows="4"
//         value={description}
//         onChange={e => setDescription(e.target.value)}
//       />
//     </div>
//   </form>

//       { error && <span className="error">{error}</span> }
// <button type="button" onClick={handleNext}>Next</button>
//     </form >
//   );
// };


export const CreateProject = ({ onClose }) => {
  const [step, setStep] = React.useState("name"); // name | import | config
  const [waiting, setWaitingStatus] = React.useState(false);




  const project = useDraftProject();
  const history = useHistory();
  const api = useAPI();

  const [name, setName] = React.useState("");
  const [error, setError] = React.useState();
  const [description, setDescription] = React.useState("");
  const [config, setConfig] = React.useState("<View></View>");

  React.useEffect(() => { setError(null); }, [name]);

  const { columns, uploading, uploadDisabled, finishUpload, pageProps } = useImportPage(project);

  const rootClass = cn("create-project");
  //const tabClass = rootClass.elem("tab");

  const toggleForm = (formName) => {
    setStep(formName); // Update the currently active form
  };

  const tabClass = rootClass.elem("tab");
  const steps = {
    name: <span className={tabClass.mod({ disabled: !!error })}>Project Information</span>,
    config: "Configure Template",
    import: <span className={tabClass.mod({ disabled: uploadDisabled })}>Import Files</span>,
  };

  // name intentionally skipped from deps:
  // this should trigger only once when we got project loaded
  React.useEffect(() => project && !name && setName(project.title), [project]);

  const projectBody = React.useMemo(() => ({
    title: name,
    description,
    label_config: config,
  }), [name, description, config]);

  const onCreate = React.useCallback(async () => {
    const imported = await finishUpload();

    if (!imported) return;

    setWaitingStatus(true);
    const response = await api.callApi('updateProject', {
      params: {
        pk: project.id,
      },
      body: projectBody,
    });

    setWaitingStatus(false);

    if (response !== null) {
      history.push(`/projects/${response.id}/data`);
    }
  }, [project, projectBody, finishUpload]);

  const onSaveName = async () => {
    if (error) return;
    const res = await api.callApi('updateProjectRaw', {
      params: {
        pk: project.id,
      },
      body: {
        title: name,
      },
    });

    if (res.ok) return;
    const err = await res.json();

    setError(err.validation_errors?.title);
  };

  const onDelete = React.useCallback(async () => {
    setWaitingStatus(true);
    if (project) await api.callApi('deleteProject', {
      params: {
        pk: project.id,
      },
    });
    setWaitingStatus(false);
    history.replace("/projects");
    onClose?.();
  }, [project]);

  return (
    <Modal
      onHide={onDelete}
      closeOnClickOutside={true}
      allowToInterceptEscape
      fullscreen
      visible
      bare
    >
      <div className={rootClass}>
        <Modal.Header>

          <Space direction="horizontal"
            size="large"
            className="space-container"
            align="start spread">
            <Button look="danger" size="compact" onClick={onDelete} waiting={waiting}>
              <IconDelete />
            </Button>
          </Space>
          <h1>    Create Project</h1>
          <Space direction="horizontal"
            size="large"
            className="space-container"
            align="start spread">
            <Button
              look="primary"
              size="compact"
              onClick={onCreate}
              waiting={waiting || uploading}
              disabled={!project || uploadDisabled || error}
              className="save-button"
            >
              <IconTick /> Save Project
            </Button>
          </Space>
        </Modal.Header>
        <div className="toggle" style={{
          position: 'relative',
          maxWidth: '100%',
          
          borderRadius: '16px',
          
          boxSizing: 'border-box',
        }}>
          {Object.entries(steps).map(([stepKey, stepValue], index) => (
            <div className="project-step" key={index} style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '0px',
              backgroundColor: '#fff',
              margin: '10px 3%',
            }}>
              <div className="project-create" onClick={() => toggleForm(stepKey)} style={{
                backgroundColor: '#5a585800',
                padding: '1px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                width: '93%',
                height: '3rem',
                margin: '0 3%',
              }}>
                <h4 style={{ fontSize: 'large', fontStyle: 'normal', marginTop: '0', marginBottom: '0' }}>{stepValue}</h4>
                {step === stepKey ? <MdKeyboardArrowUp className='expand-icon' /> : <MdKeyboardArrowDown className='expand-icon' />}
              </div>
              {step === stepKey && (
                <div className="form-content" style={{ width: '95%', margin: 'auto' }}>
                  {stepKey === 'name' && (
                    <div className='project-naming' style={{ textAlign: 'left', marginBottom: '30px' }}>
                      <ProjectName
                        name={name}
                        setName={setName}
                        error={error}
                        onSaveName={onSaveName}
                        onSubmit={onCreate}
                        description={description}
                        setDescription={setDescription}
                        show={step === "name"}
                      />
                    </div>
                  )}
                  {stepKey === 'config' && (
                    <div>
                      <ConfigPage
                        project={project}
                        onUpdate={setConfig}
                        show={step === "config"}
                        columns={columns}
                        disableSaveButton={true}
                      />
                    </div>

                  )}

                  {stepKey === 'import' && (
                    <div >
                      <ImportPage project={project} show={step === "import"} {...pageProps} />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </Modal >
  );
};
