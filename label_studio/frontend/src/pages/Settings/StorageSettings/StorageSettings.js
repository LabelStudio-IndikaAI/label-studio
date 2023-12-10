import React from 'react';
import { useState } from 'react';
import { Columns } from '../../../components/Columns/Columns';
import { Description } from '../../../components/Description/Description';
import { Block, cn } from '../../../utils/bem';
import { StorageSet } from './StorageSet';
import { FcInfo } from 'react-icons/fc';
import './StorageSettings.styl';
import { ProjectMenu } from '../../../components/ProjectMenu/ProjectMenu';


export const StorageSettings = () => {
  const rootClass = cn("storage-settings");
  const [sourceStorageCount, setSourceStorageCount] = useState(0);
  const [targetStorageCount, setTargetStorageCount] = useState(0);




  return (
    <Block name="storage-settings" style={{
      width: '100%',
      maxWidth: '90%',
      margin: 'auto',
      marginBottom: '10px',
      //backgroundColor: '#f6f6f6',
      //border: '1px solid #f6f6f6',
      padding: '0px 20px',
      borderRadius: '5px,',
      //boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      color: 'rgb(51, 51, 51)',
      fontSize: '16px',
    }}>
      <Description>
        <p style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          lineHeight: '1.5rem',
          padding: '3px',
          width: '100%',
          color: '#1A73E8',
          backgroundColor: '#FFFFFF',
          fontSize: '14px',
          boxSizing: 'border-box',
          borderRadius: '20px',
          boxShadow: '0px 0px 0px 0px',

        }}><FcInfo />Use cloud or database storage as the source for your labeling tasks or the target of your completed annotations.</p>
      </Description>


      <div style={{ display: 'flex', flexDirection: 'row', margin: 'auto', gap: '20px' }}>
        {/* <div style={{ width: '95%', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginBottom: '10px' }}>
          <div style={{ background: '#D1D3D6', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
            {sourceStorageCount > 0 ? `${sourceStorageCount} Source Cloud Storage${sourceStorageCount > 1 ? 's' : ''} Added` : 'Source Cloud Storage'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>

            <StorageSet
              rootClass={rootClass}
              onStoragesUpdated={setSourceStorageCount}
              buttonLabel="Add Source Storage"
            />

          </div>
        </div> */}
        <div style={{ width: '95%', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginBottom: '10px', backgroundColor: '#ffffff' }}>
          <div style={{ background: '#E6E6E6', color: '#616161', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
            {sourceStorageCount > 0 ? `${sourceStorageCount} Source Cloud Storage${sourceStorageCount > 1 ? 's' : ''} Added` : 'Source Cloud Storage'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
            {sourceStorageCount === 0 && (
              <div style={{ padding: '10px 0px', textAlign: 'start' }}>
                No source storage is added.
              </div>
            )}
            <StorageSet
              rootClass={rootClass}
              onStoragesUpdated={setSourceStorageCount}
              buttonLabel="Add Source Storage"
            />
          </div>
        </div>




        <div style={{ width: '95%', gap: '10px', border: '1px solid #D1D3D6', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px', marginBottom: '10px', backgroundColor: '#ffffff' }}>
          <div style={{ background: '#E6E6E6', color: '#616161', padding: '10px', textAlign: 'start', fontWeight: 'bold' }}>
            {targetStorageCount > 0 ? `${targetStorageCount} Target Cloud Storage${targetStorageCount > 1 ? 's' : ''} Added` : 'Target Cloud Storage'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
            {targetStorageCount === 0 && (
              <div style={{ padding: '10px 0px', textAlign: 'start' }}>
                No target storage is added.
              </div>
            )}
            <StorageSet
              target="export"
              buttonLabel="Add Target Storage"
              rootClass={rootClass}
              onStoragesUpdated={setTargetStorageCount}
            />
          </div>
        </div>
      </div>
    </Block>
  );
};

StorageSettings.title = "Cloud Storage";
StorageSettings.context = ProjectMenu;
StorageSettings.path = "/storage";
