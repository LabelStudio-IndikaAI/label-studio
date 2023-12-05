import React from 'react';
import { ProjectMenu } from '../../components/ProjectMenu/ProjectMenu';
import { SidebarMenu } from '../../components/SidebarMenu/SidebarMenu';
import { WebhookPage } from '../WebhookPage/WebhookPage';
import { InstructionsSettings } from './InstructionsSettings';
import { DangerZone } from './DangerZone';
import { GeneralSettings } from './GeneralSettings';
import { LabelingSettings } from './LabelingSettings';
import { MachineLearningSettings } from './MachineLearningSettings/MachineLearningSettings';
import { StorageSettings } from './StorageSettings/StorageSettings';

export const MenuLayout = ({ children, ...routeProps }) => {
  return (
    <SidebarMenu
      menuItems={[
        GeneralSettings,
        LabelingSettings,
        InstructionsSettings,
        MachineLearningSettings,
        StorageSettings,
        WebhookPage,
        DangerZone,
      ]}
      path={routeProps.match.url}
      children={children}
    />
  );
};

export const SettingsPage = {
  title: "Settings",
  path: "/settings",
  exact: true,
  alias: "project-settings",
  layout: MenuLayout,
  component: GeneralSettings,
  context: ProjectMenu,
  pages: {
    InstructionsSettings,
    LabelingSettings,
    MachineLearningSettings,
    StorageSettings,
    WebhookPage,
    DangerZone,
  },
};

//SettingsPage.context = ProjectMenu;