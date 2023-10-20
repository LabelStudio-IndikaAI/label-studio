import React from 'react';
import { Columns } from '../../../components/Columns/Columns';
import { Description } from '../../../components/Description/Description';
import { Block, cn } from '../../../utils/bem';
import { StorageSet } from './StorageSet';
import { FcInfo } from 'react-icons/fc';
import './StorageSettings.styl';


export const StorageSettings = () => {
  const rootClass = cn("storage-settings");

  return (
    <Block name="storage-settings" style={{
      width: '100%',
      maxWidth: '80%',
      margin: 'auto',
      marginBottom: '20px',
      backgroundColor: '#ffffff',
      border: '1px solid rgb(221, 221, 221)',
      padding: '20px',
      borderRadius: '5px,',
      boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 6px',
      color: 'rgb(51, 51, 51)',
      fontSize: '16px',
    }}>
      <Description>
        <p style={{
          display: 'flex',
          alignItems: 'center',
          padding: '3px',
          width: '94%',
          color: '#1A73E8',
          backgroundColor: '#d9f1ff',
          fontSize: '10px',
          boxSizing: 'border-box',
          borderRadius: '30px',
          boxShadow: '0px 0px 0px 0px',
          marginLeft: '40px',
        }}><FcInfo />Use cloud or database storage as the source for your labeling tasks or the target of your completed annotations.</p>
      </Description>

      <Columns count={2}
        className={rootClass}>
        <StorageSet
          title="Source Cloud Storage"
          buttonLabel="Add Source Storage"
          rootClass={rootClass}
        />

        <StorageSet
          title="Target Cloud Storage"
          target="export"
          buttonLabel="Add Target Storage"
          rootClass={rootClass}
        />
      </Columns>
    </Block>
  );
};

StorageSettings.title = "Cloud Storage";
StorageSettings.path = "/storage";
