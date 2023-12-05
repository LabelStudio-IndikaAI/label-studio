import { useCallback, useContext, useEffect, useRef } from 'react';
import { ProjectMenu } from '../../components/ProjectMenu/ProjectMenu';
import { Button } from '../../components';
import { Checkbox, Form, Label, TextArea, Toggle } from '../../components/Form';
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
      backgroundColor: '#f6f6f6',
      border: '1px solid #f6f6f6',
      padding: '20px',
      borderRadius: '5px',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      color: 'rgb(51, 51, 51)',
      fontSize: '16px',
    }}>
      <Form ref={formRef} action="updateProject" formData={{ ...project }} params={{ pk: project.id }} onSubmit={updateProject}>
        <Form.Row columnCount={1}>
          <Label text="Labeling Instructions" large />
          <div style={{
            padding: '3px',
            width: '47.7%',
            color: '#1A73E8',
            backgroundColor: '#D7E2FF',
            fontSize: '14px',
            boxSizing: 'border-box',
            borderRadius: '20px',
            boxShadow: '0px 0px 0px 0px',
            marginLeft: '17px',

          }}>
            <p style={{ display: 'flex', alignItems: 'center', margin: 'auto', gap: '5px', lineHeight: '1rem' }}><FcInfo size={20} /> The instruction field supports HTML markup and integrate with images and iframes (PDF).</p>
          </div>
        </Form.Row>

        <Form.Row columnCount={2}>
          <TextArea name="expert_instruction" style={{ minHeight: '128px', marginLeft: '17px' }} />
        </Form.Row>

        <Form.Row columnCount={1}>
          <Label text="Instructions Display" large />
          <div style={{ paddingLeft: 16 }}>
            <Checkbox label="Show instructions on labeling UI" name="show_instruction" small />
          </div>
        </Form.Row>

        <Form.Actions>
          <Form.Indicator>
            <span case="success">Saved!</span>
          </Form.Indicator>
          <Button type="submit" look="primary" style={{ width: 120 }}>Save Changes</Button>
        </Form.Actions>

      </Form >
    </div >
  );
};

InstructionsSettings.title = "Instructions";
InstructionsSettings.path = "/instruction";
InstructionsSettings.context = ProjectMenu;
InstructionsSettings.alias = "instructions-settings";