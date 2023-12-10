
import React, { useEffect, useState } from 'react';
import { Button } from '../../components';
import { Checkbox, Form, Input, Label, Toggle } from '../../components/Form';
import { Block, cn, Elem } from '../../utils/bem';
import { cloneDeep } from 'lodash';
import { Iconmldelete, LsPlusgray } from '../../assets/icons';
import { useAPI } from '../../providers/ApiProvider';
import "./WebhookPage.styl";
import { Space } from '../../components/Space/Space';
import { useProject } from '../../providers/ProjectProvider';
import { modal } from '../../components/Modal/Modal';
import { useModalControls } from "../../components/Modal/ModalPopup";
import { WebhookDeleteModal } from "./WebhookDeleteModal";
import { format } from 'date-fns';

const WebhookDetail = ({ webhook, webhooksInfo, fetchWebhooks, onBack, onSelectActive }) => {

  // if webhook === null - create mod
  // else update
  const rootClass = cn('webhook-detail');

  const api = useAPI();
  const [headers, setHeaders] = useState(Object.entries(webhook?.headers || []));
  const [sendForAllActions, setSendForAllActions] = useState(webhook ? webhook.send_for_all_actions : true);
  const [actions, setActions] = useState(new Set(webhook?.actions));
  const [isActive, setIsActive] = useState(webhook ? webhook.is_active : true);
  const [sendPayload, setSendPayload] = useState(webhook ? webhook.send_payload : true);
  const { project } = useProject();
  const [projectId, setProjectId] = useState(project.id);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (Object.keys(project).length === 0) {
      setProjectId(null);
    } else {
      setProjectId(project.id);
    }

  }, [project]);

  const onAddHeaderClick = () => {
    setHeaders([...headers, ['', '']]);
  };
  const onHeaderRemove = (index) => {
    let newHeaders = cloneDeep(headers);

    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };
  const onHeaderChange = (aim, event, index) => {
    let newHeaders = cloneDeep(headers);

    if (aim === 'key') {
      newHeaders[index][0] = event.target.value;
    }
    if (aim === 'value') {
      newHeaders[index][1] = event.target.value;
    }
    setHeaders(newHeaders);
  };

  const onActionChange = (event) => {
    let newActions = new Set(actions);

    if (event.target.checked) {
      newActions.add(event.target.name);
    } else {
      newActions.delete(event.target.name);
    }
    setActions(newActions);
  };

  useEffect(() => {
    if (webhook === null) {
      setHeaders([]);
      setSendForAllActions(true);
      setActions(new Set());
      setIsActive(true);
      setSendPayload(true);
      setUrl(''); // Reset the URL for new webhook creation
      return;
    }
    // Set all states for editing an existing webhook
    setHeaders(Object.entries(webhook.headers));
    setSendForAllActions(webhook.send_for_all_actions);
    setActions(new Set(webhook.actions));
    setIsActive(webhook.is_active);
    setSendPayload(webhook.send_payload);
    setUrl(webhook.url || ''); // Set the URL from the webhook prop
  }, [webhook]);


  const resetForm = () => {
    setHeaders([]);
    setSendForAllActions(true);
    setActions(new Set());
    setIsActive(true);
    setSendPayload(true);
    setUrl(''); // Reset the URL state
  };



  if (projectId === undefined) return <></>;


  return (
    <Block name='webhook'>
      <Elem name='title'>
        <><Elem
          tag='span'
          name='title-base'
          onClick={() => { onSelectActive(null); }}
        >
        </Elem>  {webhook === null ? 'New Webhook' : 'Edit Webhook'}</>
      </Elem>
      <Elem name='content'>
        <Block name={'webhook-detail'}>
          <Form
            action={webhook === null ? 'createWebhook' : 'updateWebhook'}
            params={webhook === null ? {} : { pk: webhook.id }}
            formData={webhook}
            prepareData={(data) => {
              return {
                ...data,
                'project': projectId,
                'send_for_all_actions': sendForAllActions,
                'headers': Object.fromEntries(headers.filter(([key]) => key !== '')),
                'actions': Array.from(actions),
                'is_active': isActive,
                'send_payload': sendPayload,
              };
            }}
            onSubmit={async (response) => {
              if (!response.error_message) {
                await fetchWebhooks();
                onSelectActive(null);
                resetForm();
              }
            }}

          >
            <Form.Row
              style={{ display: 'flex', flexDirection: 'column', padding: '8px 10px', gap: '0px' }}
            >
              <Label text='Payload URL' style={{ marginLeft: '-16px' }} large></Label>
              <Space className={rootClass.elem('url-space')}>
                <Input
                  name="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className={rootClass.elem('url-input')}
                  placeholder="URL" />
                <Space align='end' className={rootClass.elem('activator')}>
                  <div>
                    <Toggle
                      skip
                      checked={isActive}
                      onChange={(e) => { setIsActive(e.target.checked); }}
                    />
                  </div>
                  <span className={rootClass.elem('black-text')}>Active</span>
                </Space>
              </Space>
            </Form.Row>
            <Form.Row style={{ display: 'flex', flexDirection: 'column', padding: '2px 10px', gap: '0px' }}>
              <Label text='Headers' style={{ marginLeft: '-16px' }} large></Label>
              <div className={rootClass.elem('headers')}>
                <div className={rootClass.elem('headers-content')}>
                  <Space spread className={rootClass.elem('headers-control')}>
                    <Button
                      type='button'
                      onClick={onAddHeaderClick}
                      className={rootClass.elem('headers-add')}
                      icon={<LsPlusgray />}
                    ></Button>
                  </ Space>
                  {
                    headers.map(([headKey, headValue], index) => {
                      return (
                        <Space key={index} className={rootClass.elem('headers-row')} columnCount={3} >
                          <Input className={rootClass.elem('headers-input')}
                            skip
                            placeholder="header"
                            value={headKey}
                            onChange={(e) => onHeaderChange('key', e, index)} />
                          <Input className={rootClass.elem('headers-input')}
                            skip
                            placeholder="value"
                            value={headValue}
                            onChange={(e) => onHeaderChange('value', e, index)} />
                          <div>
                            <Button className={rootClass.elem('headers-remove')}
                              type='button'
                              icon={<Iconmldelete />}
                              onClick={() => onHeaderRemove(index)}></Button>
                          </div>
                        </Space>
                      );
                    })
                  }
                </div>
              </div>
            </Form.Row>

            <Block name='webhook-payload' style={{ marginLeft: '-6px', marginTop: '10px', marginBottom: '5px' }}>
              <Elem name='title'>
                <Label text="Payload Customization" large />
              </Elem>
              <Elem name='content'>
                <Elem name='content-row'>
                  <Checkbox
                    skip
                    checked={sendPayload}
                    onChange={(e) => { setSendPayload(e.target.checked); }}
                    label="Send payload" />
                </Elem>
                <Elem name='content-row'>
                  <Checkbox
                    skip
                    checked={sendForAllActions}
                    label="Send for all actions"
                    onChange={(e) => {
                      const checked = e.target.checked;

                      setSendForAllActions(checked);
                      // If unchecked, clear the actions
                      if (!checked) {
                        setActions(new Set());
                      }
                    }} />
                </Elem>
                <div>
                  <Elem name='content-row-actions'>
                    <div style={{ padding: '5px 0px' }}>
                      Customize Payload Send Actions
                    </div>
                    <Elem name='actions'>
                      {Object.entries(webhooksInfo).map(([key, value]) => (
                        <div key={key}>
                          <div>
                            <Checkbox
                              skip
                              name={key}
                              type='checkbox'
                              label={value.name}
                              onChange={(e) => {
                                onActionChange(e);
                                // If unchecked, set sendForAllActions to false
                                if (!e.target.checked) {
                                  setSendForAllActions(false);
                                } else {
                                  // If checked, check if all individual checkboxes are checked
                                  const allChecked = Object.keys(webhooksInfo).every((key) => actions.has(key));

                                  // If all are checked, set sendForAllActions to true
                                  if (allChecked) {
                                    setSendForAllActions(true);
                                  }
                                }
                              }}
                              checked={actions.has(key) || sendForAllActions}></Checkbox>
                          </div>
                        </div>
                      ))}
                    </Elem>
                  </Elem>
                </div>
              </Elem>
            </Block>



            <Elem name='controls'>
              {
                webhook === null ?
                  null
                  : (
                    <Button
                      look="danger"
                      type='button'
                      className={rootClass.elem('delete-button')}
                      onClick={() => WebhookDeleteModal({
                        onDelete: async () => {
                          await api.callApi('deleteWebhook', { params: { pk: webhook.id } });
                          onBack();
                          await fetchWebhooks();
                        },
                      })}>
                      Delete Webhook...
                    </Button>
                  )}
              <div className={rootClass.elem('status')}>
                <Form.Indicator />
              </div>
              <span
                style={{
                  color: 'red',
                  cursor: 'pointer',

                }}
                className={rootClass.elem('cancel-button')}
                onClick={() => {
                  onBack();
                  resetForm();
                }}
              >Discard Changes
              </span>
              <Button
                primary
                className={rootClass.elem('save-button')}
              >
                {webhook === null ? 'Add Webhook' : 'Save'}
              </Button>
            </Elem>
          </Form>
        </Block>

      </Elem>
    </Block >
  );
};

export default WebhookDetail;


