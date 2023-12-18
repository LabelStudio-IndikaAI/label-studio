import React, { useEffect, useState } from 'react';
import { Block } from "../../../utils/bem";
import { Spinner } from "../../../components";
import axios from 'axios';

export const OrgData = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user/organization-detail/');

        console.log('API Response:', response.data);
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Block>
      {loading ? (
        <div style={{
          flex: 1,
          width: '100%',
          height: '100%',
          display: "flex",
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Spinner size={64} />
        </div>
      ) : (
        <div style={{ margin: '20px 8px' }}>
          <div style={{ margin: '10px 8px', border: '1px solid #D1D3D6', borderRadius: '5px' }}>
            <div style={{ background: '#E6E6E6', color: '#616161', padding: '5px 10px', textAlign: 'start' }}>
              Active Organization
            </div>
            <div style={{ padding: '10px', textAlign: 'start' }}>
              <p>{userData.active_organization_title}</p>
            </div>
          </div>
          <div style={{ margin: '10px 8px', border: '1px solid #D1D3D6', borderRadius: '5px' }}>
            <div style={{ background: '#E6E6E6', color: '#616161', padding: '5px 10px', textAlign: 'start' }}>
              Organization Information
            </div>
            <div style={{ padding: '10px', textAlign: 'start' }}>
              {/* <p>Your Role {userData.pretty_role}</p> */}
              <p>
                <span style={{ display: 'inline-block', width: '150px', textAlign: 'left' }}>Organization ID</span>
                <span style={{ display: 'inline-block', width: 'calc(100% - 150px)', textAlign: 'right' }}>{userData.active_organization_id}</span>
              </p>
              <p>
                <span style={{ display: 'inline-block', width: '150px', textAlign: 'left' }}>Owner</span>
                <span style={{ display: 'inline-block', width: 'calc(100% - 150px)', textAlign: 'right' }}>{userData.active_organization_created_by}</span>
              </p>
              <p>
                <span style={{ display: 'inline-block', width: '150px', textAlign: 'left' }}>Created at</span>
                <span style={{ display: 'inline-block', width: 'calc(100% - 150px)', textAlign: 'right' }}>{userData.active_organization_created_at}</span>
              </p>
            </div>

          </div>
          <div style={{ margin: '10px 8px', border: '1px solid #D1D3D6', borderRadius: '5px' }}>
            <div style={{ background: '#E6E6E6', color: '#616161', padding: '5px 10px', textAlign: 'start' }}>
              Your Contributions
            </div>
            <div style={{ padding: '10px', textAlign: 'start' }}>
              <p>
                <span style={{ display: 'inline-block', width: '250px', textAlign: 'left' }}>Annotations you completed</span>
                <span style={{ display: 'inline-block', width: 'calc(100% - 250px)', textAlign: 'right' }}>{userData.active_organization_annotations_count}</span>
              </p>
              <p>
                <span style={{ display: 'inline-block', width: '250px', textAlign: 'left' }}>Projects you contributed to</span>
                <span style={{ display: 'inline-block', width: 'calc(100% - 250px)', textAlign: 'right' }}>{userData.active_organization_contributed_project_count}</span>
              </p>
            </div>
          </div>

        </div>
      )}
    </Block>
  );
};
