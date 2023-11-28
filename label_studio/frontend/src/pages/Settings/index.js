import React from 'react';
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
    <>
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
    </>
  );
};

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







// import React, { useEffect, useState } from 'react';
// import { useContextProps } from '../../providers/RoutesProvider';
// import { renderRoutes } from 'react-router-config';
// import { SidebarMenu } from '../../components/SidebarMenu/SidebarMenu';
// import { WebhookPage } from '../WebhookPage/WebhookPage';
// import { DangerZone } from './DangerZone';
// import { GeneralSettings } from './GeneralSettings';
// import { InstructionsSettings } from './InstructionsSettings';
// import { LabelingSettings } from './LabelingSettings';
// import { MachineLearningSettings } from './MachineLearningSettings/MachineLearningSettings';
// import { StorageSettings } from './StorageSettings/StorageSettings';
// import { Button } from '../../components';
// import { useRouteMatch } from 'react-router-dom';

// export const MenuLayout = ({ children, ...routeProps }) => {
//   const match = useRouteMatch();

//   return (
//     <SidebarMenu
//       menuItems={[
//         GeneralSettings,
//         LabelingSettings,
//         InstructionsSettings,
//         MachineLearningSettings,
//         StorageSettings,
//         WebhookPage,
//         DangerZone,
//       ]}
//       //path={routeProps.match.url}
//       path={match ? match.url : ''}
//       children={children}
//     />
//   );
// };

// export const SettingsPage = ({ route }) => {
//   const setContextProps = useContextProps();
//   const [isButtonClicked, setIsButtonClicked] = useState(false);

//   useEffect(() => {
//     setContextProps({ showButton: true, handleButtonClick: () => setIsButtonClicked(true) });
//   }, [setContextProps]);

//   return (
//     <MenuLayout>
//       <GeneralSettings />
//     </MenuLayout>
//   );
// };

// SettingsPage.title = "Settings";
// SettingsPage.path = "/settings";
// SettingsPage.exact = true;
// SettingsPage.layout = MenuLayout;
// SettingsPage.component = GeneralSettings;
// SettingsPage.pages = {
//   InstructionsSettings,
//   LabelingSettings,
//   MachineLearningSettings,
//   StorageSettings,
//   WebhookPage,
//   DangerZone,
// };

// SettingsPage.context = ({ showButton, handleButtonClick }) => {
//   if (!showButton) return null;

//   return (
//     <div>
//       <Button onClick={handleButtonClick}>
//         Button
//       </Button>
//     </div>
//   );
// };








// import React, { useEffect, useState } from 'react';
// import { Route, Switch, useRouteMatch } from 'react-router-dom';
// import { useContextProps } from '../../providers/RoutesProvider';
// import { SidebarMenu } from '../../components/SidebarMenu/SidebarMenu';
// import GeneralSettings from './GeneralSettings';
// import InstructionsSettings from './InstructionsSettings';
// import LabelingSettings from './LabelingSettings';
// import MachineLearningSettings from './MachineLearningSettings/MachineLearningSettings';
// import StorageSettings from './StorageSettings/StorageSettings';
// import WebhookPage from '../WebhookPage/WebhookPage';
// import DangerZone from './DangerZone';
// import { Button } from '../../components';


// export const MenuLayout = ({ children, ...routeProps }) => {
//   const match = useRouteMatch();

//   const menuItems = [
//     { title: "GeneralSettings", path: GeneralSettings.path },
//     { title: "InstructionsSettings", path: InstructionsSettings.path },
//     { title: "LabelingSettings", path: LabelingSettings.path },
//     { title: "MachineLearningSettings", path: MachineLearningSettings.path },
//     { title: "StorageSettings", path: StorageSettings.path },
//     { title: "WebhookPage", path: WebhookPage.path },
//     { title: "DangerZone", path: DangerZone.path },
//   ];

//   return (
//     <SidebarMenu
//       menuItems={menuItems}
//       path={routeProps.match.url}
//       children={children}
//     />
//   );
// };

// export const SettingsPage = ({ route }) => {
//   const setContextProps = useContextProps();
//   const [isButtonClicked, setIsButtonClicked] = useState(false);

//   useEffect(() => {
//     setContextProps({ showButton: true, handleButtonClick: () => setIsButtonClicked(true) });
//   }, [setContextProps, setIsButtonClicked]);

//   const match = useRouteMatch();

//   return (
//     <MenuLayout>
//       <Switch>
//         <Route exact path={match.path} component={GeneralSettings} />
//         <Route path={`${match.path}/instructions`} component={InstructionsSettings} />
//         <Route path={`${match.path}/labeling`} component={LabelingSettings} />
//         <Route path={`${match.path}/machine-learning`} component={MachineLearningSettings} />
//         <Route path={`${match.path}/storage`} component={StorageSettings} />
//         <Route path={`${match.path}/webhook`} component={WebhookPage} />
//         <Route path={`${match.path}/danger-zone`} component={DangerZone} />
//       </Switch>
//     </MenuLayout>
//   );
// };

// SettingsPage.title = "Settings";
// SettingsPage.path = "/settings";
// SettingsPage.exact = true;
// SettingsPage.layout = MenuLayout;
// SettingsPage.component = GeneralSettings;
// SettingsPage.pages = {
//   InstructionsSettings,
//   LabelingSettings,
//   MachineLearningSettings,
//   StorageSettings,
//   WebhookPage,
//   DangerZone,
// };

// SettingsPage.context = ({ showButton, handleButtonClick }) => {
//   if (!showButton) return null;

//   return (
//     <div>
//       <Button onClick={handleButtonClick}>Button</Button>
//     </div>
//   );
// };
