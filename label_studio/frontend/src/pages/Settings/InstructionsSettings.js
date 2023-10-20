import { useCallback, useContext, useEffect, useRef } from 'react';
import { Button } from '../../components';
import { Form, Label, TextArea, Toggle } from '../../components/Form';
import { MenubarContext } from '../../components/Menubar/Menubar';
import { ProjectContext } from '../../providers/ProjectProvider';
import { FcInfo } from 'react-icons/fc';
export const InstructionsSettings = () => {
  const { project, fetchProject } = useContext(ProjectContext);
  const pageContext = useContext(MenubarContext);
  const formRef = useRef();

  useEffect(() => {
    pageContext.setProps({ formRef });
  }, [formRef]);

  const updateProject = useCallback(() => {
    fetchProject(project.id, true);
  }, [project]);

  return (
    <div style={{
      width: '100%',
      maxWidth: '90%',
      margin: 'auto',
      marginBottom: '20px',
      backgroundColor: '#ffffff',
      border: '1px solid rgb(221, 221, 221)',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      color: 'rgb(51, 51, 51)',
      fontSize: '16px',
    }}>
      <Form ref={formRef} action="updateProject" formData={{ ...project }} params={{ pk: project.id }} onSubmit={updateProject}>
        <Form.Row columnCount={1}>
          <Label text="Instructions" large/>
          <Label text="Labeling Instructions" small/>
          <div style={{
            padding: '3px',
            width: '48%',
            color: '#1A73E8',
            backgroundColor: '#d9f1ff',
            fontSize: '10px',
            boxSizing: 'border-box',
            borderRadius: '30px',
            boxShadow: '0px 0px 0px 0px',
            marginLeft: '17px',
            
          }}>
            <p style={{ display: 'flex', alignItems: 'center', margin: 'auto' }}><FcInfo/> The instruction field supports HTML markup and integrate with images and iframes (PDF).</p>
          </div>
        </Form.Row>

        <Form.Row columnCount={2}>
          <TextArea name="expert_instruction" style={{ minHeight: '128px', marginLeft: '17px' }}/>
        </Form.Row>

        <Form.Row columnCount={1}>
          <Label text="Instructions Display" large/>
          <div style={{ paddingLeft: 16 }}>
            <Toggle label="Show instructions on labeling UI" name="show_instruction" small/>
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
  );
};

InstructionsSettings.title = "Instructions";
InstructionsSettings.path = "/instruction";
