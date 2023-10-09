import { useCallback, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Button } from '../../../components';
import { Modal } from '../../../components/Modal/Modal';
import { Space } from '../../../components/Space/Space';
import { useAPI } from '../../../providers/ApiProvider';
import { ProjectProvider, useProject } from '../../../providers/ProjectProvider';
import { useFixedLocation } from '../../../providers/RoutesProvider';
import { Elem } from '../../../utils/bem';
import { useRefresh } from '../../../utils/hooks';
import { ImportPage } from './Import';
import { useImportPage } from './useImportPage';

export const Inner = () => {
  const history = useHistory();
  const location = useFixedLocation();
  const modal = useRef();
  const refresh = useRefresh();
  const { project } = useProject();
  const [waiting, setWaitingStatus] = useState(false);
  const api = useAPI();

  const { uploading, uploadDisabled, finishUpload, fileIds, pageProps } = useImportPage(project);

  const backToDM = useCallback(() => {
    const path = location.pathname.replace(ImportModal.path, '');
    const search = location.search;
    const pathname = `${path}${search !== '?' ? search : ''}`;

    return refresh(pathname);
  }, [location, history]);

  const onCancel = useCallback(async () => {
    setWaitingStatus(true);
    await api.callApi('deleteFileUploads', {
      params: {
        pk: project.id,
      },
      body: {
        file_upload_ids: fileIds,
      },
    });
    setWaitingStatus(false);
    modal?.current?.hide();
    backToDM();
  }, [modal, project, fileIds, backToDM]);

  const onFinish = useCallback(async () => {
    const imported = await finishUpload();

    if (!imported) return;
    backToDM();
  }, [backToDM, finishUpload]);

  return (
    <Modal
      title="Import data"
      ref={modal}
      onHide={() => backToDM()}
      closeOnClickOutside={true}
      fullscreen
      visible
      bare
    >
      <div className="rootclass" style={{ 
        flex: '1',
        minHeight: '0',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <Modal.Header divided>
          <Elem block="modal" name="title">Import Data</Elem>

          <Space>
            <Button waiting={waiting} onClick={onCancel}>Cancel</Button>
            <Button look="primary" onClick={onFinish} waiting={waiting || uploading} disabled={uploadDisabled}>
              Import
            </Button>
          </Space>
        </Modal.Header>
        <div className="toggle" style={{
          position: 'relative',
          maxWidth: '100%',
          height: '100%',
          display: 'grid',
          borderRadius: '16px',
          gridTemplateColumns: 'repeat(1, 1fr)',
          boxSizing: 'border-box',
        }}>
          <div className="import-step" style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '0px',
            backgroundColor: '#fff',
            width: '80%',
            height: '150%',
            margin: '10px 10%',
          }}>
            <div className="import-create" style={{
              backgroundColor: '#5a585800',
              padding: '1px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              width: '93%',
              margin: '0 3%',
            }}>
              <div className="import-content" style={{ width: '90%', margin: '0 4%' }}>
                <ImportPage project={project} {...pageProps} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal >
  );
};
export const ImportModal = () => {
  return (
    <ProjectProvider>
      <Inner />
    </ProjectProvider>
  );
};

ImportModal.path = "/import";
ImportModal.modal = true;
