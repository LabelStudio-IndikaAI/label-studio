import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StaticContent } from '../../app/StaticContent/StaticContent';
import { IconBook, IconFolder, IconPersonInCircle, IconTerminal, LsDoor, LsGitHub, LsSettings, LsSlack } from '../../assets/icons';
import { useConfig } from '../../providers/ConfigProvider';
import { useContextComponent, useFixedLocation } from '../../providers/RoutesProvider';
import { cn } from '../../utils/bem';
import { absoluteURL, isDefined } from '../../utils/helpers';
//import { Breadcrumbs } from '../Breadcrumbs/Breadcrumbs';
import { Dropdown } from "../Dropdown/Dropdown";
import { Hamburger } from "../Hamburger/Hamburger";
import { Menu } from '../Menu/Menu';
import { Userpic } from '../Userpic/Userpic';
import { UserInfo } from '../Userpic/UserInfo';
import { VersionNotifier, VersionProvider } from '../VersionNotifier/VersionNotifier';
import './Menubar.styl';
import './MenuContent.styl';
import './MenuSidebar.styl';
import { IoMdHelp } from 'react-icons/io';
//import { IconQuestion } from '../../assets/icons';

export const MenubarContext = createContext();

const LeftContextMenu = ({ className }) => (
  <StaticContent
    id="context-menu-left"
    className={className}
  >{(template) => { template; }}</StaticContent>
);

const RightContextMenu = ({ className, ...props }) => {
  const { ContextComponent, contextProps } = useContextComponent();

  return ContextComponent ? (
    <div className={className}>
      <ContextComponent {...props} {...(contextProps ?? {})} />
    </div>
  ) : (
    <StaticContent
      id="context-menu-right"
      className={className}
    />
  );
};

export const Menubar = ({
  enabled,
  defaultOpened,
  defaultPinned,
  children,
  onSidebarToggle,
  onSidebarPin,
}) => {
  const menuDropdownRef = useRef();
  const useMenuRef = useRef();
  const location = useFixedLocation();
  const helpDropdownRef = useRef();

  const config = useConfig();
  const [sidebarOpened, setSidebarOpened] = useState(defaultOpened ?? false);
  const [sidebarPinned, setSidebarPinned] = useState(defaultPinned ?? false);
  const [PageContext, setPageContext] = useState({
    Component: null,
    props: {},
  });

  // const getInitials = (name) => {
  //   const parts = name.split(' ');

  //   if (parts.length === 1) return parts[0][0];
  //   return parts[0][0] + parts[parts.length - 1][0];
  // };

  // const userInitials = getInitials(config.user.name || "");



  const menubarClass = cn('menu-header');
  const menubarContext = menubarClass.elem('context');
  const sidebarClass = cn('sidebar');
  const contentClass = cn('content-wrapper');
  const contextItem = menubarClass.elem('context-item');
  const showNewsletterDot = !isDefined(config.user.allow_newsletters);

  const sidebarPin = useCallback((e) => {
    e.preventDefault();

    const newState = !sidebarPinned;

    setSidebarPinned(newState);
    onSidebarPin?.(newState);
  }, [sidebarPinned]);

  const sidebarToggle = useCallback((visible) => {
    const newState = visible;

    setSidebarOpened(newState);
    onSidebarToggle?.(newState);
  }, [sidebarOpened]);

  const providerValue = useMemo(() => ({
    PageContext,

    setContext(ctx) {
      setTimeout(() => {
        setPageContext({
          ...PageContext,
          Component: ctx,
        });
      });
    },

    setProps(props) {
      setTimeout(() => {
        setPageContext({
          ...PageContext,
          props,
        });
      });
    },

    contextIsSet(ctx) {
      return PageContext.Component === ctx;
    },
  }), [PageContext]);

  useEffect(() => {
    if (!sidebarPinned) {
      menuDropdownRef?.current?.close();
    }
    useMenuRef?.current?.close();
  }, [location]);

  return (
    <div className={contentClass}>
      {enabled && (
        <div className={menubarClass}>
          <Dropdown.Trigger
            dropdown={menuDropdownRef}
            closeOnClickOutside={!sidebarPinned}
          >
            <div className={`${menubarClass.elem('trigger')} main-menu-trigger`}>
              <img src={absoluteURL("/static/icons/DATA.jpg")} alt="Data Studio Logo" height="42" style={{ marginRight: '5px' }} />
              {/* <span style={{ marginLeft: '4px', fontWeight: 'bold' }}>Data Studio</span> */}
              <Hamburger opened={sidebarOpened} />
            </div>
          </Dropdown.Trigger>


          <div className={menubarContext}>
            <LeftContextMenu className={contextItem} />
            <RightContextMenu className={contextItem} />
          </div>

          <Dropdown.Trigger ref={helpDropdownRef} align="right" content={(
            <Menu>
              <Menu.Item
                icon={<IconTerminal />}
                label="API"
                href=""
                data-external
              />
              <Menu.Item
                icon={<IconBook />}
                label="Docs"
                href=""
                data-external
              />
              <Menu.Item
                icon={<LsGitHub />}
                label="GitHub"
                href=""
                data-external
              />
              <Menu.Item
                icon={<LsSlack />}
                label="Slack"
                href=""
                data-external
              />
            </Menu>
          )}>
            <div className="menubar-help-button-box">
              <div className={menubarClass.elem('help-button')}>
                <button className="help-icon" style={{
                  position: 'relative',
                  top: '5px',
                  right: '0px',
                  width: '60px',
                  height: '31px',
                  background: '#f6f6f6',
                  border: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                }}>
                  {/* <IconQuestion style={{ fontSize: '16px' }} /> */}
                  <IoMdHelp/>
                </button>
              </div>
            </div>
          </Dropdown.Trigger>


          <Dropdown.Trigger ref={useMenuRef} align="right" content={(
            <Menu>
              <Menu.Item
                icon={<LsSettings />}
                label="Account &amp; Settings"
                href="/user/account"
                data-external
              />
              <Menu.Item
                icon={<IconPersonInCircle />}
                label="Organization"
                href="/organization"
                data-external
                exact
              />
              <Menu.Item
                icon={<LsDoor />}
                label="Log Out"
                href={absoluteURL("/logout")}
                data-external
              />
              {showNewsletterDot && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    className={cn("newsletter-menu-item")}
                    href="/user/account"
                    data-external
                  >
                    <span>Please check new notification settings in the Account & Settings page</span>
                    <span className={cn("newsletter-menu-badge")} />
                  </Menu.Item>
                </>
              )}
            </Menu>
          )}>
            <div title={config.user.email} className={menubarClass.elem('user')}>
              <Userpic user={config.user} />
              <UserInfo user={config.user} />
              {showNewsletterDot && (
                <div className={menubarClass.elem('userpic-badge')} />
              )}

            </div>
          </Dropdown.Trigger>

        </div>
      )}

      <VersionProvider>
        <div className={contentClass.elem('body')}>
          {enabled && (
            <Dropdown
              ref={menuDropdownRef}
              onToggle={sidebarToggle}
              onVisibilityChanged={() => window.dispatchEvent(new Event('resize'))}
              visible={sidebarOpened}
              className={[sidebarClass, sidebarClass.mod({ floating: !sidebarPinned })].join(" ")}
              style={{ width: 240 }}
            >
              <Menu>
                <Menu.Item
                  label="Projects"
                  to="/projects"
                  icon={<IconFolder />}
                  data-external
                  exact
                />

                <Menu.Spacer />

                <VersionNotifier showNewVersion />

                <VersionNotifier showCurrentVersion />

                <Menu.Divider />

              </Menu>
            </Dropdown>
          )}

          <MenubarContext.Provider value={providerValue}>
            <div className={contentClass.elem('content').mod({ withSidebar: sidebarPinned && sidebarOpened })}>
              {children}
            </div>
          </MenubarContext.Provider>
        </div>
      </VersionProvider>
    </div>
  );
};
