import React, { useCallback, useContext, useEffect } from 'react';
import { MenubarContext } from '../../components/Menubar/Menubar';
import { ProjectMenu } from '../../components/ProjectMenu/ProjectMenu';
import { Button } from '../../components';
import { Form, Input, TextArea } from '../../components/Form';
import { RadioGroup } from '../../components/Form/Elements/RadioGroup/RadioGroup';
import { ProjectContext } from '../../providers/ProjectProvider';
import { Block, cn, Elem } from '../../utils/bem';
import './settings.styl';

export const GeneralSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const pageContext = useContext(MenubarContext);
  const formRef = React.useRef();

  useEffect(() => {
    pageContext.setProps({ formRef });
  }, [formRef]);

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
    <div className={cn("simple-settings")} style={{
      width: '100%',
      maxWidth: '95%',
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
      <Block name="general-settings">
        <Elem name={'wrapper'}>
          <Form
            ref={formRef}
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
      </Block>
    </div>
  );
};

GeneralSettings.menuItem = "General";
GeneralSettings.path = "/";
GeneralSettings.context = ProjectMenu;
GeneralSettings.exact = true;