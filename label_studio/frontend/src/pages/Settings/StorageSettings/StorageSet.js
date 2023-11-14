import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Columns } from '../../../components';
import { confirm, modal } from '../../../components/Modal/Modal';
import { Spinner } from '../../../components/Spinner/Spinner';
import { ApiContext } from '../../../providers/ApiProvider';
import { useProject } from '../../../providers/ProjectProvider';
import { StorageCard } from './StorageCard';
import { StorageForm } from './StorageForm';
import { LsPlus } from '../../../assets/icons';

export const StorageSet = ({ title, target, rootClass, buttonLabel, onStoragesUpdated }) => {
  const api = useContext(ApiContext);
  const { project } = useProject();
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [storageTypes, setStorageTypes] = useState([]);

  useEffect(() => {
    api.callApi('storageTypes', {
      params: {
        target,
      },
    }).then(types => {
      setStorageTypes(types ?? []);
    });
  }, []);

  const fetchStorages = useCallback(async () => {
    if (!project.id) {
      console.warn("Project ID not provided");
      return;
    }

    setLoading(true);
    const result = await api.callApi('listStorages', {
      params: {
        project: project.id,
        target,
      },
    });

    const storageTypes = await api.callApi('storageTypes', {
      params: {
        target,
      },
    });

    setStorageTypes(storageTypes);

    if (result !== null) {
      setStorages(result);
      setLoaded(true);
    }

    setLoading(false);
  }, [project]);

  useEffect(() => {
    fetchStorages();
  }, [fetchStorages]);

  useEffect(() => {
    onStoragesUpdated(storages.length);
  }, [storages, onStoragesUpdated]);

  const showStorageFormModal = useCallback((storage) => {
    const action = storage ? "Edit" : "Add";
    const actionTarget = target === 'export' ? 'Target' : 'Source';
    const title = `${action} ${actionTarget} Storage`;

    const modalRef = modal({
      title,
      closeOnClickOutside: false,
      style: { width: '760px', height: '500px', overflow: 'auto' },
      body: (
        <StorageForm
          target={target}
          storage={storage}
          project={project.id}
          rootClass={rootClass}
          storageTypes={storageTypes}
          onSubmit={async () => {
            await fetchStorages();
            modalRef.close();
          }}
        />
      ),
      // footer: (
      //   <>
      //     Save completed annotations to Amazon S3, Google Cloud, Microsoft Azure, or Redis.
      //     <br/>
      //     <a href="https://labelstud.io/guide/storage.html">See more in the documentation</a>.
      //   </>
      // ),
    });
  }, [project, fetchStorages, target, rootClass]);

  const onEditStorage = useCallback(async (storage) => {
    showStorageFormModal(storage);
  }, [showStorageFormModal]);

  const onDeleteStorage = useCallback(async (storage) => {
    confirm({
      title: "Deleting storage",
      body: "This action cannot be undone. Are you sure?",
      buttonLook: "destructive",
      onOk: async () => {
        const response = await api.callApi('deleteStorage', {
          params: {
            type: storage.type,
            pk: storage.id,
            target,
          },
        });

        if (response !== null) fetchStorages();
      },
    });
  }, [fetchStorages]);

  useEffect(() => {
    fetchStorages();
  }, [fetchStorages]);

  // return (
  //   <Columns.Column>
  //     {(loading && !loaded) ? (
  //       <div className={rootClass.elem("empty")}>
  //         <Spinner size={32} />
  //         {/* <Spinner /> */}
  //       </div>
  //     ) : storages.length === 0 ? (
  //       null
  //     ) : storages.map(storage => (
  //       <StorageCard
  //         key={storage.id}
  //         storage={storage}
  //         target={target}
  //         rootClass={rootClass}
  //         storageTypes={storageTypes}
  //         onEditStorage={onEditStorage}
  //         onDeleteStorage={onDeleteStorage}
  //       />
  //     ))}

  //     <div className={rootClass.elem("controls")} style={{ marginTop: '10px' }}>
  //       <Button onClick={() => showStorageFormModal()}>
  //         {buttonLabel}
  //       </Button>
  //     </div>
  //   </Columns.Column>
  // );
  return (
    <Columns.Column>
      {(loading && !loaded) ? (
        <div className={rootClass.elem("empty")}>
          <Spinner size={32} />
        </div>
      ) : storages.length === 0 ? (
        null
      ) : (
        <div>
          {storages.map((storage, index) => (
            <div key={storage.id}>
              <StorageCard
                storage={storage}
                target={target}
                rootClass={rootClass}
                storageTypes={storageTypes}
                onEditStorage={onEditStorage}
                onDeleteStorage={onDeleteStorage}
              />
              {index < storages.length - 1 && <hr />} {/* Horizontal line */}
            </div>
          ))}
        </div>
      )}

      <div className={rootClass.elem("controls")} style={{ marginTop: '10px' }}>
        <Button look="primary" onClick={() => showStorageFormModal()} style={{ display: 'flex', gap: '5px' }}>
          <LsPlus /> {buttonLabel}
        </Button>
      </div>
    </Columns.Column>
  );
};


