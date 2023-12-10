import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useAPI } from '../../providers/ApiProvider';
import "./WebhookPage.styl";

import { ProjectMenu } from '../../components/ProjectMenu/ProjectMenu';
import WebhookList from './WebhookList';
import WebhookDetail from './WebhookDetail';
import { useProject } from '../../providers/ProjectProvider';
import { Button, Spinner } from '../../components';
import { Block, Elem } from '../../utils/bem';
import { IconInfo } from '../../assets/icons';
import { useHistory } from 'react-router';
import { FcInfo } from 'react-icons/fc';

const Webhook = () => {
  const [activeWebhook, setActiveWebhook] = useState(null);
  const [webhooks, setWebhooks] = useState(null);
  const [webhooksInfo, setWebhooksInfo] = useState(null);


  const history = useHistory();

  const api = useAPI();
  const { project } = useProject();

  const projectId = useMemo(() => {
    if (history.location.pathname.startsWith('/projects')) {
      if (Object.keys(project).length === 0) {
        return null;
      } else {
        return project.id;
      }
    } else {
      return undefined;
    }
  }, [project, history]);

  console.log(projectId, history.location.pathname);
  const fetchWebhooks = useCallback(async () => {
    if (projectId === null) {
      setWebhooks(null);
      return;
    }
    let params = {};

    if (projectId !== undefined) {
      params['project'] = projectId;
    } else {
      params['project'] = null;
    }
    const webhooks = await api.callApi('webhooks', {
      params,
    });

    if (webhooks) setWebhooks(webhooks);
  }, [projectId]);

  const fetchWebhooksInfo = useCallback(async () => {
    if (projectId === null) {
      setWebhooksInfo(null);
      return;
    }
    let params = {};

    if (projectId !== undefined) {
      params['organization-only'] = false;
    }

    const info = await api.callApi('webhooksInfo',
      {
        params,
      },
    );

    if (info) setWebhooksInfo(info);
  }, [projectId]);

  useEffect(() => {
    fetchWebhooks();
    fetchWebhooksInfo();
  }, [project, projectId]);

  if (webhooks === null || webhooksInfo === null || projectId === null) {
    return null;
  }

  return (
    <Block name='webhook-wrap'>
      <div style={{ display: 'flex', flexDirection: 'row', margin: 'auto', gap: '20px' }}>
        <div style={{ width: '100%' }}>
          <Elem name='header'>
            <p>
              <FcInfo size={25} />Webhooks notify external services in case of a certain event. When any specified event occurs, a POST request is sent to your provided URLs.
            </p>
          </Elem>
          {/* <div style={{ width: '100%', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginTop: '10px', marginBottom: '10px' }}>
            {webhooks && webhooks.length > 0 ? (
              <div style={{ background: '#D1D3D6', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
                {webhooks.length} Webhook{webhooks.length !== 1 ? 's' : ''} added
              </div>
            ) : (
              <div style={{ background: '#D1D3D6', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
                No webhook added
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <WebhookList
                onSelectActive={setActiveWebhook}
                fetchWebhooks={fetchWebhooks}
                webhooks={webhooks}
              />
            </div>
          </div> */}
          <div style={{ width: '100%', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginTop: '10px', marginBottom: '10px' }}>
            {webhooks && webhooks.length > 0 ? (
              <div style={{ background: '#E6E6E6',color: '#616161', padding: '10px', textAlign: 'start' }}>
                {webhooks.length} Webhook{webhooks.length !== 1 ? 's' : ''} added
              </div>
            ) : (
              <div style={{ background: '#E6E6E6',color: '#616161', padding: '10px', textAlign: 'start' }}>
                No webhook added
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {webhooks && webhooks.length > 0 ? (
                <WebhookList
                  onSelectActive={setActiveWebhook}
                  fetchWebhooks={fetchWebhooks}
                  webhooks={webhooks}
                />
              ) : (
                <div style={{ padding: '10px', textAlign: 'start' }}>
                  You can add a webhook using the right pane.
                </div>
              )}
            </div>
          </div>

        </div>
        <div style={{ width: '100%', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginBottom: '10px' }}>
          <WebhookDetail
            onSelectActive={setActiveWebhook}
            onBack={() => setActiveWebhook(null)}
            //webhook={null}
            webhook={activeWebhook ? webhooks.find(obj => obj.id === activeWebhook) : null}
            fetchWebhooks={fetchWebhooks}
            webhooksInfo={webhooksInfo}
          />
        </div>
      </div>
    </Block>
  );
};

export const WebhookPage = {
  title: "Webhooks",
  path: "/webhooks",
  component: Webhook,
};

WebhookPage.context = ProjectMenu;
