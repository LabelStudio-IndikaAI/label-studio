import React, { useCallback } from 'react';
import { Iconmldelete, Iconmledit } from '../../assets/icons';
import { Button } from '../../components';
import { Checkbox, Form, Input, Label } from '../../components/Form';
import { modal } from '../../components/Modal/Modal';
import { Block, Elem } from '../../utils/bem';
import "./WebhookPage.styl";
import { format } from 'date-fns';
import { useAPI } from '../../providers/ApiProvider';
import { WebhookDeleteModal } from './WebhookDeleteModal';
import { useProject } from '../../providers/ProjectProvider';


//Test
const WebhookList = ({ onSelectActive, onAddWebhook, webhooks, fetchWebhooks }) => {

  const api = useAPI();

  if (webhooks === null) return <></>;

  const onActiveChange = useCallback(async (event) => {
    let value = event.target.checked;

    await api.callApi('updateWebhook', {
      params: {
        pk: event.target.name,
      },
      body: {
        is_active: value,
      },
    });
    await fetchWebhooks();
  }, []);

  return (
    <Block name='webhook'>
      {/* <Elem name='controls'>
        <Button onClick={onAddWebhook}>
        Add Webhook
        </Button>
      </Elem> */}
      <Elem>
        {webhooks.length === 0 ?
          null
          : (
            <Block name='webhook-list'>
              {
                webhooks.map(
                  (obj, index) => (
                    <React.Fragment key={obj.id}>
                      <Elem name='item'>
                        <Elem name='list-info'>
                          <Elem name='item-url' onClick={() => onSelectActive(obj.id)}>
                            {obj.url}
                          </Elem>
                          <Elem name='item-active' style={{ display: 'flex' }}>
                            <Checkbox
                              name={obj.id}
                              checked={obj.is_active}
                              onChange={onActiveChange}
                            />
                            <span className="status-text">
                              {obj.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </Elem>
                        </Elem>
                        {/* <Elem name='item-date'>
                        Created {format(new Date(obj.created_at), 'dd MMM yyyy, HH:mm')}
                        </Elem> */}
                        <Elem name='item-control'>
                          <button
                            onClick={() => onSelectActive(obj.id)}

                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                          ><Iconmledit /> Edit</button>
                          <button
                            onClick={() => WebhookDeleteModal({
                              onDelete: async () => {
                                await api.callApi('deleteWebhook', { params: { pk: obj.id } });
                                await fetchWebhooks();
                              },
                            })}


                            style={{ border: '1px solid #ff0000', color: '#ff0000', display: 'flex', alignItems: 'center', gap: '5px' }}
                          ><Iconmldelete /> Delete</button>
                        </Elem>
                      </Elem>
                      {index < webhooks.length - 1 && <hr style={{ margin: 'auto', width: '95%' }} />}
                    </React.Fragment>
                  ),
                )
              }
            </Block>
          )}
      </Elem>
    </Block>
  );
};


export default WebhookList;
