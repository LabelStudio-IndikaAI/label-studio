import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const PeopleData = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Update the URL to match the new endpoint
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
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h2>User Data:</h2>
          <p>Organization: {userData.active_organization_title}</p>
          {/* <p>Role: {userData.pretty_role}</p> */}
          <p>Annotations Count: {userData.active_organization_annotations_count}</p>
          <p>Contributed Projects Count: {userData.active_organization_contributed_project_count}</p>
          <p>Organization ID: {userData.active_organization_id}</p>
          <p>Created By: {userData.active_organization_created_by}</p>
          <p>Created At: {userData.active_organization_created_at ? new Date(userData.active_organization_created_at).toLocaleString() : ''}</p>
        </div>
      )}
    </div>
  );
};
