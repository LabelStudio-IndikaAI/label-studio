import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LsPlus } from "../../../assets/icons";
import { Button } from "../../../components";
import { Description } from "../../../components/Description/Description";
import { Input } from "../../../components/Form";
import { HeidiTips } from "../../../components/HeidiTips/HeidiTips";
import { modal } from "../../../components/Modal/Modal";
import { Space } from "../../../components/Space/Space";
import { useAPI } from "../../../providers/ApiProvider";
import { useConfig } from "../../../providers/ConfigProvider";
import { Block, Elem } from "../../../utils/bem";
import { FF_LSDV_E_297, isFF } from "../../../utils/feature-flags";
import { copyText } from "../../../utils/helpers";
import { IconCopy, IconReset } from "../../../assets/icons";
import "./PeopleInvitation.styl";
import { PeopleList } from "./PeopleList";
import "./PeoplePage.styl";
import { SelectedUser } from "./SelectedUser";
import { PeopleData } from "./PeopleData";

const Invitation = ({ link, updateLink }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = useCallback(() => {
    setCopied(true);
    copyText(link);
    setTimeout(() => setCopied(false), 1500);
  }, [link]);

  return (
    <Elem name="invite">
      <div style={{ margin: '5px 8px', border: '1px solid #D1D3D6', borderRadius: '5px' }}>
        <div style={{ background: '#E6E6E6', color: '#616161', padding: '5px 10px', textAlign: 'start' }}>
          Invite people to join your organization
        </div>
        <div style={{ padding: '10px', textAlign: 'start' }}>
          <Description>
            You can invite people via a link to join your Data Studio instance. People you invite will have full access to your projects.
          </Description>
          <Input
            value={link}
            style={{ width: '100%' }}
            readOnly
          />
          <Space style={{ justifyContent: 'left', marginTop: '10px' }}>
            <button style={{ border: '1px solid #1A73E8', color: '#1A73E8', display: 'flex' }} onClick={updateLink}>
              <IconReset style={{ marginRight: '8px' }}/> Reset Link
            </button>
            <button primary style={{ border: '1px solid #1A73E8', color: '#1A73E8', display: 'flex' }} onClick={copyLink}>
              <IconCopy style={{ marginRight: '8px' }}/> {copied ? "Copied!" : "Copy"}
            </button>
          </Space>
        </div>
      </div>
    </Elem>
  );
};

export const PeoplePage = () => {
  const api = useAPI();
  const inviteModal = useRef();
  const config = useConfig();
  const [selectedUser, setSelectedUser] = useState(null);

  const [link, setLink] = useState();

  const selectUser = useCallback((user) => {
    setSelectedUser(user);

    localStorage.setItem('selectedUser', user?.id);
  }, [setSelectedUser]);

  const setInviteLink = useCallback((link) => {
    const hostname = config.hostname || location.origin;

    setLink(`${hostname}${link}`);
  }, [config, setLink]);

  const updateLink = useCallback(() => {
    api.callApi('resetInviteLink').then(({ invite_url }) => {
      setInviteLink(invite_url);
    });
  }, [setInviteLink]);

  // const inviteModalProps = useCallback((link) => ({
  //   title: "Invite people",
  //   style: { width: 640, height: 472 },
  //   body: () => (
  //     <InvitationModal link={link} />
  //   ),
  //   footer: () => {
  //     const [copied, setCopied] = useState(false);

  //     const copyLink = useCallback(() => {
  //       setCopied(true);
  //       copyText(link);
  //       setTimeout(() => setCopied(false), 1500);
  //     }, []);

  //     return (
  //       <Space spread>
  //         <Space>
  //           <Button style={{ width: 170 }} onClick={() => updateLink()}>
  //             Reset Link
  //           </Button>
  //         </Space>
  //         <Space>
  //           <Button primary style={{ width: 170 }} onClick={copyLink}>
  //             {copied ? "Copied!" : "Copy link"}
  //           </Button>
  //         </Space>
  //       </Space>
  //     );
  //   },
  //   bareFooter: true,
  // }), []);

  // const showInvitationModal = useCallback(() => {
  //   inviteModal.current = modal(inviteModalProps(link));
  // }, [inviteModalProps, link]);

  const defaultSelected = useMemo(() => {
    return localStorage.getItem('selectedUser');
  }, []);

  useEffect(() => {
    api.callApi("inviteLink").then(({ invite_url }) => {
      setInviteLink(invite_url);
    });
  }, []);

  // useEffect(() => {
  //   inviteModal.current?.update(inviteModalProps(link));
  // }, [link]);

  return (
    <Block name="people">
      <Elem name="peopledetail">
        <PeopleData />
      </Elem>
      <Elem name="peoplecontrol">
        <Elem name="controls">
          <Elem>
            <Elem>
              <Invitation link={link} updateLink={updateLink} />
            </Elem>
          </Elem>
        </Elem>
        <Elem name="list">
          <Elem>
            <Elem name="content">
              <PeopleList
                selectedUser={selectedUser}
                defaultSelected={defaultSelected}
                onSelect={(user) => selectUser(user)}
              />

              {selectedUser ? (
                <SelectedUser
                  user={selectedUser}
                  onClose={() => selectUser(null)}
                />
              ) : isFF(FF_LSDV_E_297) && (
                <HeidiTips collection="organizationPage" />
              )}

            </Elem>
          </Elem>
        </Elem>
      </Elem>
    </Block>
  );
};

PeoplePage.title = "People";
PeoplePage.path = "/";
