import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button } from '../../../components';
import { Description } from '../../../components/Description/Description';
import { Divider } from '../../../components/Divider/Divider';
import { ErrorWrapper } from '../../../components/Error/Error';
import { InlineError } from '../../../components/Error/InlineError';
import { Checkbox, Form, Input, Label, TextArea, Toggle } from '../../../components/Form';
import { modal } from '../../../components/Modal/Modal';
import { useAPI } from '../../../providers/ApiProvider';
import { ProjectContext } from '../../../providers/ProjectProvider';
import { MachineLearningList } from './MachineLearningList';
import { ProjectModelVersionSelector } from './ProjectModelVersionSelector';
import { ModelVersionSelector } from './ModelVersionSelector';
import { FF_DEV_1682, isFF } from '../../../utils/feature-flags';
import './MachineLearningSettings.styl';
import { FcInfo } from 'react-icons/fc';
import { ModelListDropdown } from './ModelListDropdown';
import models from './models.json';


export const MachineLearningSettings = () => {
  const api = useAPI();
  const { project, fetchProject } = useContext(ProjectContext);
  const [mlError, setMLError] = useState();
  const [backends, setBackends] = useState([]);
  //const [cardCount, setCardCount] = useState(backends.length);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBackend, setSelectedBackend] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showMLFormModal, setShowMLFormModal] = useState(false);


  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setSelectedBackend(null); // Resetting the selected backend ensures the form is in "add" mode
    setShowMLFormModal(true); // Assuming you have a state to control the visibility of the modal
  };


  // Function to reset the selected model
  const resetSelectedModel = () => {
    setSelectedModel(null);
  };


  const fetchAndSetBackends = async () => {
    if (!project.id) {
      // Project ID is undefined, return early
      return;
    }

    try {
      const fetchedBackends = await fetchBackends();

      setTotalCount(fetchedBackends.length);
    } catch (error) {
      console.error('Error fetching backends:', error);
      // Handle the error if needed
    }
  };

  useEffect(() => {
    fetchAndSetBackends();
  }, [project]);

  const fetchBackends = useCallback(async () => {
    const models = await api.callApi('mlBackends', {
      params: {
        project: project.id,
      },
    });

    if (models) setBackends(models);
    setTotalCount(models.length);
  }, [project, setBackends, setTotalCount]);

  const formTitle = selectedBackend ? 'Edit ML Model' : 'Add New ML Model';
  const ShowMLFormModal = ({ project, fetchBackends, backend, setMLError, setSelectedBackend, selectedModelData }) => {
    //const [formData, setFormData] = useState(backend ?? {});
    //const formTitle = `${backend ? 'Edit' : 'Add'} model`;
    const [formData, setFormData] = useState(selectedModelData ?? backend ?? {});

    useEffect(() => {
      if (selectedModelData) {
        setFormData(selectedModelData);
      } else {
        setFormData(backend ?? {});
      }
    }, [selectedModelData, backend]);



    // const resetForm = () => {
    //   setFormData({});
    //   setSelectedBackend(null);
    // };
    const resetForm = () => {
      setFormData(backend ?? {});
      setSelectedBackend(null);
      if (resetSelectedModel) {
        resetSelectedModel();
      }
    };

    const handleSubmit = async (response) => {
      try {
        if (!response.error_message) {
          await fetchBackends();
          setFormData({}); // Clear form data
          setSelectedBackend(null);
        }

      } catch (error) {
        console.error('Error fetching backends:', error);

      }
    };

    return (
      <Form
        //action={backend ? "updateMLBackend" : "addMLBackend"}
        action={selectedModelData ? "addMLBackend" : (backend ? "updateMLBackend" : "addMLBackend")}
        formData={formData}
        params={{ pk: backend?.id }}
        onSubmit={handleSubmit}
      >

        <Input type="hidden" name="project" value={project.id} />

        <Form.Row columnCount={1}>
          <Input name="title" label="Model Name" placeholder="Enter the model name"

          />
        </Form.Row>
        <Form.Row columnCount={1}>
          <Input name="url" label="Model URL" placeholder="Enter a valid URL for this model" required

          />
        </Form.Row>

        <Form.Row columnCount={1}>
          <TextArea name="description" label="Model Description (Optional)" placeholder="Describe this ML model in a few words" style={{ minHeight: 60 }}

          />
        </Form.Row>

        {/* {isFF(FF_DEV_1682) && !!backend && (
          <Form.Row columnCount={2}>
            <ModelVersionSelector
              object={backend}
              apiName="modelVersions"
              label="Version"
            />
          </Form.Row>
        )}

        {isFF(FF_DEV_1682) && (
          <Form.Row columnCount={1}>
            <div>
              <Toggle
                name="auto_update"
                label="Allow version auto-update"
              />
            </div>
          </Form.Row>
        )} */}

        <Form.Row columnCount={1}>
          <div>
            <Checkbox
              name="is_interactive"
              label="Use for interactive preannotations"
            />
          </div>
        </Form.Row>


        <Form.Actions>
          {(Object.keys(formData).length > 0) && (
            <span
              style={{
                color: 'red',
                cursor: 'pointer',
                marginLeft: '10px',
              }}
              onClick={resetForm}
            >
              Discard Changes
            </span>
          )}

          <Button type="submit" look="primary" onClick={() => setMLError(null)}>
            Save Changes
          </Button>
        </Form.Actions>

        <Form.ResponseParser>{response => (
          <>
            {response.error_message && (
              <ErrorWrapper error={{
                response: {
                  detail: `Failed to ${backend ? 'save' : 'add new'} ML backend.`,
                  exc_info: response.error_message,
                },
              }} />
            )}
          </>
        )}</Form.ResponseParser>

        <InlineError />

      </Form>
    );
  };

  // const onEditBackend = useCallback((backend) => {
  //   setSelectedBackend(backend);
  // }, []);

  const onEditBackend = useCallback((backend) => {
    setSelectedBackend(backend);
    // Also reset the selected model if editing is distinct from selecting a model
    setSelectedModel(null);
  }, [setSelectedBackend, setSelectedModel]);







  useEffect(() => {
    if (project.id) {
      fetchBackends()
        .catch(error => {
          console.error('Error fetching backends:', error);
          // Handle the error, if needed
        });
    }
  }, [project]);





  return (
    <>
      <div style={{
        width: '100%',
        maxWidth: '90%',
        margin: 'auto',
        marginBottom: '10px',
        backgroundColor: '#f6f6f6',
        //border: '1px solid #f6f6f6',
        padding: '0px 20px',
        borderRadius: '5px',
        //boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
        color: 'rgb(51, 51, 51)',
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{ width: '50%' }}>
          <Description>
            <div style={{
              padding: '3px',
              width: '95%',
              color: '#1A73E8',
              backgroundColor: '#D7E2FF',
              fontSize: '12px',
              boxSizing: 'border-box',
              borderRadius: '20px',
              boxShadow: '0px 0px 0px 0px',
              //marginLeft: '17px',

            }}>
              <p style={{ display: 'flex', alignItems: 'center', margin: 'auto', gap: '5px', lineHeight: '1rem' }}><FcInfo size={20} />You can add one or more machine learning models to predict labels for your data.</p>
            </div>
          </Description>
          <div style={{ width: '95%', gap: '10px', marginBottom: '10px' }}>
            <ModelListDropdown
              models={models}
              selectedModelTitle={selectedModel?.title}
              onSelectModel={handleModelSelect}
              
            />

          </div>
          {/* <Divider height={32} backgroundColor={"black"} /> */}
          <hr style={{ marginLeft: 'initial', width: '95%' }} />
          <div style={{ width: '95%', gap: '10px' }}>
            <Form action="updateProject"
              formData={{ ...project }}
              params={{ pk: project.id }}
              onSubmit={() => fetchProject()}
              autosubmit
            >
              {/* {(!isFF(FF_DEV_1682) || !backends.length) && (
                <ProjectModelVersionSelector />
              )} */}
              <div style={{ background: '#F6F6F6', color: 'black', padding: '10px', textAlign: 'start' }}>
                ML Assisted Labeling Preferences
              </div>
              <Form.Row columnCount={1}>
                

                <div style={{ paddingLeft: 0, fontSize: 12 }}>
                  <Checkbox
                    style={{ fontSize: '12px !important' }}
                    label="Start model training after annotations are submitted or updated"
                    name="start_training_on_annotation_update"
                  />
                </div>

                <div style={{ paddingLeft: 0, fontSize: 12 }}>
                  <Checkbox
                    label="Retrieve predictions when loading a task automatically"
                    name="evaluate_predictions_automatically"
                  />
                </div>

                <div style={{ paddingLeft: 0, fontSize: 12 }}>
                  <Checkbox
                    label="Show predictions in the Label Stream and Quick View"
                    name="show_collab_predictions"
                  />
                </div>
              </Form.Row>



              <Form.Actions>
                <Form.Indicator>
                  <span case="success">Saved!</span>
                </Form.Indicator>
                <Button type="submit" look="primary" style={{ width: 120 }}>Save</Button>
              </Form.Actions>
            </Form>
          </div>
          <hr style={{ marginLeft: 'initial', width: '95%' }} />
          <div style={{ width: '95%', gap: '10px', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginTop: '20px', marginBottom: '10px' }}>
            {totalCount > 0 ? (
              <div style={{ background: '#E6E6E6', color: '#616161', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
                {totalCount} ML models added
              </div>
            ) : (
              <div style={{ background: '#E6E6E6', color: '#616161', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
                No ML models added
              </div>
            )}

            {/* <div style={{ display: 'flex', flexDirection: 'row' }}>
            <MachineLearningList
              onEdit={(backend) => showMLFormModal(backend)}
              fetchBackends={fetchBackends}
              backends={backends}
              totalCount={totalCount}
            />
            </div> */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {backends.length > 0 ? (
                backends.map((backend, index) => (
                  <div key={backend.id}>
                    <MachineLearningList
                      onEdit={onEditBackend}
                      fetchBackends={fetchBackends}
                      backends={[backend]}
                      totalCount={totalCount}
                    />
                    {index < backends.length - 1 && <hr style={{ margin: 'auto', width: '95%' }} />}
                  </div>
                ))
              ) : (
                <div style={{ padding: '10px', textAlign: 'start' }}>
                  You can add a model using the dropdown or the right pane.
                </div>
              )}

            </div>



          </div>

        </div>
        <div style={{ width: '50%' }}>

          <div style={{ width: '95%', margin: '10px auto', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px' }}>
            <div style={{ background: '#F6F6F6', color: 'black', padding: '10px', textAlign: 'start' }}>
              {formTitle}
            </div>
            {/* {showMLFormModal()} */}
            <div style={{ padding: '5px' }}>

              <ShowMLFormModal
                project={project}
                fetchBackends={fetchBackends}
                backend={selectedBackend}
                selectedModelData={selectedModel}
                resetSelectedModel={resetSelectedModel}
                setMLError={setMLError}
                setSelectedBackend={setSelectedBackend}
              />

            </div>
          </div>

        </div>
      </div>
    </>
  );

};

MachineLearningSettings.title = "ML Model";
MachineLearningSettings.path = "/ml";