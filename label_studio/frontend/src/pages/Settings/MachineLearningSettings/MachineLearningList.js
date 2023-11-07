import { format, isValid } from 'date-fns';
import { useCallback, useContext } from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import truncate from 'truncate-middle';
import { Button, Card, Dropdown, Menu } from '../../../components';
import { DescriptionList } from '../../../components/DescriptionList/DescriptionList';
import { confirm } from '../../../components/Modal/Modal';
import { Oneof } from '../../../components/Oneof/Oneof';
import { ApiContext } from '../../../providers/ApiProvider';
import { cn } from '../../../utils/bem';
import { Icondesinfo, Icondeslink, Iconmldelete, Iconmledit } from '../../../assets/icons';

export const MachineLearningList = ({ backends, fetchBackends, onEdit, totalCount }) => {
  const rootClass = cn('ml');
  const api = useContext(ApiContext);

  const onDeleteModel = useCallback(async (backend) => {
    await api.callApi('deleteMLBackend', {
      params: {
        pk: backend.id,
      },
    });
    await fetchBackends();
  }, [fetchBackends, api]);

  const onStartTraining = useCallback(async (backend) => {
    await api.callApi('trainMLBackend', {
      params: {
        pk: backend.id,
      },
    });
    await fetchBackends();
  }, [fetchBackends, api]);

  return (
    <div className={rootClass}>
      {backends.map(backend => (
        <BackendCard
          key={backend.id}
          backend={backend}
          onStartTrain={onStartTraining}
          onDelete={onDeleteModel}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

const BackendCard = ({ backend, onStartTrain, onEdit, onDelete }) => {
  
  const confirmDelete = useCallback((backend) => {
    confirm({
      title: "Delete ML Backend",
      body: "This action cannot be undone. Are you sure?",
      buttonLook: "destructive",
      onOk() { onDelete?.(backend); },
    });
  }, [backend, onDelete]);

  return (
  // <Card style={{ marginTop: 0 }} header={backend.title} extra={(
  //   <div className={cn('ml').elem('info')}>
  //     <BackendState backend={backend}/>

  //     <Dropdown.Trigger align="right" content={(
  //       <Menu size="small">
  //         <Menu.Item onClick={() => onEdit(backend)}>Edit</Menu.Item>
  //         <Menu.Item onClick={() => confirmDelete(backend)}>Delete</Menu.Item>
  //       </Menu>
  //     )}>
  //       <Button type="link" icon={<FaEllipsisV/>}/>
  //     </Dropdown.Trigger>
  //   </div>
  // )}>
  //   <DescriptionList className={cn('ml').elem('summary')}>
  //     <DescriptionList.Item termStyle={{ whiteSpace: 'nowrap' }}>
  //       {truncate(backend.url, 20, 10, '...')}
  //     </DescriptionList.Item>
  //     {backend.description && (
  //       <DescriptionList.Item
  //         children={backend.description}
  //       />
  //     )}
  //     {/* <DescriptionList.Item term="Version">
  //       {backend.model_version && isValid(backend.model_version) ?
  //         format(new Date(isNaN(backend.model_version) ? backend.model_version: Number(backend.model_version)), 'MMMM dd, yyyy ∙ HH:mm:ss')
  //         : backend.model_version || 'unknown'}
  //     </DescriptionList.Item> */}
  //   </DescriptionList>

  //   <Button disabled={backend.state !== "CO"} onClick={() => onStartTrain(backend)}>
  //     Start Training
  //   </Button>
  // </Card>

    <div style={{ display: 'flex', flexDirection: 'column', width: '95%' }}>
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>{backend.title}</div>
          <div>{BackendState({ backend })}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Icondesinfo />{backend.description}</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Icondeslink />{truncate(backend.url, 20, 10, '...')}</p>

        </div>
        <div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <button onClick={() => onEdit(backend)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid black',
            }}><Iconmledit /> Edit</button>
            <button onClick={() => confirmDelete(backend)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid #ff0000',
              color: '#ff0000',
            }}><Iconmldelete /> Delete</button>
          </div>
        </div>
      </div>
      <div>
        <Button disabled={backend.state !== 'CO'} onClick={() => onStartTrain(backend)}>
          Start Training
        </Button>
      </div>

    </div>
  );
};

const BackendState = ({ backend }) => {
  const { state } = backend;

  return (
    <div className={cn('ml').elem('status')}>
      <span className={cn('ml').elem('indicator').mod({ state })}></span>
      <Oneof value={state} className={cn('ml').elem('status-label')}>
        <span case="DI">Disconnected</span>
        <span case="CO">Connected</span>
        <span case="ER">Error</span>
        <span case="TR">Training</span>
        <span case="PR">Predicting</span>
      </Oneof>
    </div>
  );
};
