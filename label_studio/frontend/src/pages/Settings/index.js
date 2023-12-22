import React, { useContext, useMemo } from 'react';
import { ProjectMenu } from '../../components/ProjectMenu/ProjectMenu';
import { SidebarMenu } from '../../components/SidebarMenu/SidebarMenu';
import { WebhookPage } from '../WebhookPage/WebhookPage';
import { InstructionsSettings } from './InstructionsSettings';
import { DangerZone } from './DangerZone';
import { GeneralSettings } from './GeneralSettings';
import { LabelingSettings } from './LabelingSettings';
import { MachineLearningSettings } from './MachineLearningSettings/MachineLearningSettings';
import { StorageSettings } from './StorageSettings/StorageSettings';
import { ContributionSettings } from './ContributionSettings';
import { ProjectContext } from '../../providers/ProjectProvider';


export const MenuLayout = ({ children, ...routeProps }) => {
  return (
    <SidebarMenu
      menuItems={[
        GeneralSettings,
        LabelingSettings,
        InstructionsSettings,
        MachineLearningSettings,
        ContributionSettings,
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
    ContributionSettings,
    StorageSettings,
    WebhookPage,
    DangerZone,
  },
};
// export const SettingsPage = {
//   title: "Settings",
//   path: "/settings",
//   exact: true,
//   alias: "project-settings",
//   layout: MenuLayout,
//   component: GeneralSettings,
//   context: ProjectMenu,
//   pages: {
//     InstructionsSettings,
//     LabelingSettings,
//     MachineLearningSettings,
//     ContributionSettings,
//     StorageSettings,
//     WebhookPage,
//     DangerZone,
//   },
// };


// export const MenuLayout = ({ children, ...routeProps}) => {
//   // const project = useContext(ProjectContext);

//   const menuItems = useMemo(() => {
//     const items = [
//       GeneralSettings,
//       LabelingSettings,
//       InstructionsSettings,
//       MachineLearningSettings,
//       StorageSettings,
//       WebhookPage,
//       DangerZone,
//     ];

//     if (Project && !Project.is_public) {
//       items.splice(5, 0, ContributionSettings); // Insert ContributionSettings at the desired position
//     }

//     return items;
//   }, [project?.is_public]);

//   return (
//     <SidebarMenu
//       menuItems={menuItems}
//       path={routeProps.match.url}
//       children={children}
//     />
//   );
// };
//SettingsPage.context = ProjectMenu;