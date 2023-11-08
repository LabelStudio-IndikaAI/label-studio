import React, { useCallback, useContext } from 'react';
import { Button } from '../../components';
import { Form, Input, Label, Select, TextArea } from '../../components/Form';
import { RadioGroup } from '../../components/Form/Elements/RadioGroup/RadioGroup';
import { ProjectContext } from '../../providers/ProjectProvider';
import { Block, cn, Elem } from '../../utils/bem';
import { EnterpriseBadge } from '../../components/Badges/Enterprise';
import './settings.styl';
import { HeidiTips } from '../../components/HeidiTips/HeidiTips';
import { FF_LSDV_E_297, isFF } from '../../utils/feature-flags';
import { createURL } from '../../components/HeidiTips/utils';
import { Caption } from '../../components/Caption/Caption';

export const GeneralSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);

  const updateProject = useCallback(() => {
    if (project.id) fetchProject(project.id, true);
  }, [project]);

  const colors = [
    '#FFFFFF',
    '#F52B4F',
    '#FA8C16',
    '#F6C549',
    '#9ACA4F',
    '#51AAFD',
    '#7F64FF',
    '#D55C9D',
  ];

  const samplings = [
    { value: "Sequential", label: "Sequential", description: "Tasks are ordered by Data manager ordering" },
    { value: "Uniform", label: "Random", description: "Tasks are chosen with uniform random" },
  ];

  return (
  // <Block name="general-settings">
  //   <Elem name={'wrapper'}>
  //     <Form
  //       action="updateProject"
  //       formData={{ ...project }}
  //       params={{ pk: project.id }}
  //       onSubmit={updateProject}
  //     >
  //       <Form.Row columnCount={1} rowGap="32px">
  //         <Input
  //           name="title"
  //           label="Project Name"
  //           labelProps={{ large: true }}
  //         />

  //         <TextArea
  //           name="description"
  //           label="Description"
  //           labelProps={{ large: true }}
  //           style={{ minHeight: 128 }}
  //         />
  //         {isFF(FF_LSDV_E_297) && (
  //           <Block name="workspace-placeholder">
  //             <Elem name="badge-wrapper">
  //               <Elem name="title">Workspace</Elem>
  //               <EnterpriseBadge />
  //             </Elem>
  //             <Select placeholder="Select an option" disabled options={[]} />
  //             <Caption>
  //               Simplify project management by organizing projects into workspaces. <a target="_blank" href={createURL("https://docs.humansignal.com/guide/manage_projects#Create-workspaces-to-organize-projects", {
  //                 experiment: 'project_settings_tip',
  //                 treatment: 'simplify_project_management',
  //               })}>Learn more</a>
  //             </Caption>
  //           </Block>
  //         )}
  //         <RadioGroup name="color" label="Color" size="large" labelProps={{ size: "large" }}>
  //           {colors.map(color => (
  //             <RadioGroup.Button key={color} value={color}>
  //               <Block name="color" style={{ '--background': color }} />
  //             </RadioGroup.Button>
  //           ))}
  //         </RadioGroup>

  //         <RadioGroup label="Task Sampling" labelProps={{ size: "large" }} name="sampling" simple>
  //           {samplings.map(({ value, label, description }) => (
  //             <RadioGroup.Button
  //               key={value}
  //               value={`${value} sampling`}
  //               label={`${label} sampling`}
  //               description={description}
  //             />
  //           ))}
  //           {isFF(FF_LSDV_E_297) && (
  //             <RadioGroup.Button
  //               key="uncertainty-sampling"
  //               value=""
  //               label={<>Uncertainty sampling <EnterpriseBadge /></>}
  //               disabled
  //               description={(
  //                 <>
  //                   Tasks are chosen according to model uncertainty score (active learning mode). <a target="_blank" href={createURL("https://docs.humansignal.com/guide/active_learning", {
  //                     experiment: 'project_settings_workspace',
  //                     treatment: 'workspaces',
  //                   })}>Learn more</a>
  //                 </>
  //               )}
  //             />
  //           )}
  //         </RadioGroup>
  //       </Form.Row>

    //       <Form.Actions>
    //         <Form.Indicator>
    //           <span case="success">Saved!</span>
    //         </Form.Indicator>
    //         <Button type="submit" look="primary" style={{ width: 120 }}>Save</Button>
    //       </Form.Actions>
    //     </Form>
    //   </Elem>
    //   {isFF(FF_LSDV_E_297) && (
    //     <HeidiTips collection="projectSettings" />
    //   )}
    // </Block>
    <div style={{
      width: '100%',
      maxWidth: '95%',
      margin: 'auto',
      marginBottom: '20px',
      backgroundColor: '#f6f6f6',
      border: '1px solid #f6f6f6',
      padding: '20px',
      borderRadius: '5px',
      //boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      color: 'rgb(51, 51, 51)',
      fontSize: '16px',
    }}>
      <Block name="general-settings">
        <Elem name={'wrapper'}>
          <Form
            action="updateProject"
            formData={{ ...project }}
            params={{ pk: project.id }}
            onSubmit={updateProject}
          >
            {/* Container for Form Inputs */}
            <div className="general-settings-container" style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
            }}>
              <div className="form-input-container" style={{
                width: '100%',
                maxWidth: '528px',
                marginBottom: '20px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                padding: '20px',
                borderRadius: '5px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                color: '#333',
                fontSize: '16px',
              }}>
                <Form.Row columnCount={1} rowGap="0px">
                  <Input
                    name="title"
                    label="Project Name"
                    labelProps={{ large: true }}
                  />

                  <TextArea
                    name="description"
                    label="Description"
                    labelProps={{ large: true }}
                    style={{ minHeight: 128 }}
                  />
                </Form.Row>
              </div>

              {/* Container for RadioGroup */}
              <div className="radiogroup-container" style={{
                width: '100%',
                maxWidth: '528px',
                marginBottom: '20px',
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                padding: '20px',
                borderRadius: '5px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                color: '#333',
                fontSize: '16px',
              }}>
                <RadioGroup name="color" label="Color" size="large" labelProps={{ size: "large" }}>
                  {colors.map(color => (
                    <RadioGroup.Button key={color} value={color}>
                      <Block name="color" style={{ '--background': color }} />
                    </RadioGroup.Button>
                  ))}
                </RadioGroup>

                <RadioGroup label="Task Sampling" labelProps={{ size: "large" }} name="sampling" simple>
                  {samplings.map(({ value, label, description }) => (
                    <RadioGroup.Button
                      key={value}
                      value={`${value} sampling`}
                      label={`${label} sampling`}
                      description={description}
                    />
                  ))}
                  {/* {isFF(FF_LSDV_E_297) && (
                  <RadioGroup.Button
                    key="uncertainty-sampling"
                    value=""
                    label={<>Uncertainty sampling <EnterpriseBadge /></>}
                    disabled
                    description={(
                      <>
                        Tasks are chosen according to model uncertainty score (active learning mode). <a target="_blank" href={createURL("https://docs.humansignal.com/guide/active_learning", {
                          experiment: 'project_settings_workspace',
                          treatment: 'workspaces',
                        })}>Learn more</a>
                      </>
                    )}
                  />
                )} */}
                </RadioGroup>
              </div>
            </div>
            {/* End of Container for RadioGroup */}

            <Form.Actions>
              <Form.Indicator>
                <span case="success">Saved!</span>
              </Form.Indicator>
              <Button type="submit" look="primary" style={{ width: 120, marginRight: 27 }}>Save</Button>
            </Form.Actions>
          </Form>
        </Elem>
        {/* {isFF(FF_LSDV_E_297) && (
        <HeidiTips collection="projectSettings" />
      )} */}
      </Block>
    </div>
  );
};

GeneralSettings.menuItem = "General";
GeneralSettings.path = "/";
GeneralSettings.exact = true;
