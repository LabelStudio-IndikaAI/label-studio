import React from 'react';
import { ApiContext } from '../../providers/ApiProvider';
import { useContextProps } from '../../providers/RoutesProvider';
import { useParams as useRouterParams } from 'react-router';
import { Redirect } from 'react-router-dom';
import { Space } from '../../components/Space/Space';
import { NavLink } from 'react-router-dom';
import { Button } from '../../components';
import { SidebarMenu } from '../../components/SidebarMenu/SidebarMenu';
import { WebhookPage } from '../WebhookPage/WebhookPage';
import { DangerZone } from './DangerZone';
import { GeneralSettings } from './GeneralSettings';
import { InstructionsSettings } from './InstructionsSettings';
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

// SettingsPage.context = () => {
//   const links = {
//     '/settings': 'Settings',
//   };

//   return (
//     <Space size="small">
//       {Object.entries(links).map(([path, label]) => (
//         <Button
//           key={path}
//           tag={NavLink}
//           size="compact"
//           to="#"
//           data-external
//         >
//           {label}
//         </Button>
//       ))}
//     </Space>
//   );
// };

export const SettingsPage = {
  title: "Settings",
  path: "/settings",
  exact: true,
  layout: MenuLayout,
  component: GeneralSettings,
  pages: {
    InstructionsSettings,
    LabelingSettings,
    MachineLearningSettings,
    StorageSettings,
    WebhookPage,
    DangerZone,
  },
};
