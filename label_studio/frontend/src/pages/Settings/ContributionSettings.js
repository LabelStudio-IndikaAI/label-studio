import React, { useEffect, useState } from 'react';
import { useProject } from "../../providers/ProjectProvider"; // Import useProject hook
import './contribution.styl';

export const ContributionSettings = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contributors, setContributors] = useState([]);
    const { project } = useProject(); // Use the useProject hook
    const projectId = project.id; // Get projectId from the project context
    console.log('ProjectId:', projectId);
    const organizationId = 1; // Get projectId from the project context

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/organizations/${organizationId}/memberships`);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const data = await response.json();
            console.log('Users2:', data);
            setUsers(data.results.map(user => ({
                member_id: user.user.id,
                name: `${user.user.first_name || ''} ${user.user.last_name || ''}`.trim(),
            })));
            console.log('Users1:', users);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchContributors1 = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/contributors/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Contributors:', data);
            setContributors(data.map(contributor => ({
                member_id: contributor.user_id, 
                name: `${contributor.username}`.trim(),
            })));
        } catch (error) {
            console.error('Error fetching contributors:', error);
            setError(error);
        }
    };

    const fetchContributors = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/contributors/`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Contributors:', data);
            setContributors(data.map(contributor => ({
                // member_id: contributor.user.user_id,
                // name: `${contributor.user.first_name || ''} ${contributor.user.last_name || ''}`.trim(),
                member_id: contributor.user_id,
                name: contributor.name,
            })));  // Use the data directly as it contains user names and IDs
            console.log('Contributors:', contributors);
        } catch (error) {
            setError(error);
        }
    };
    

    useEffect(() => {
        if(project && project.id){

            fetchUsers();
            fetchContributors();
        }
    }, [project.id]);
    
    useEffect(() => {
        fetchUsers();
        fetchContributors();
    }, []);

    const handleCheckboxChange = (user) => {
        setSelectedUsers(prev => {
            if (prev.find(u => u.member_id === user.member_id)) {
                return prev.filter(u => u.member_id !== user.member_id);
            } else {
                return [...prev, user];
            }
        });
    };

    const handleButtonClick = async () => {
        const apiEndpoint = `/api/projects/${project.id}/add_contributors`; // Use projectId in the API endpoint
    
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_ids: selectedUsers.map(user => user.member_id) })
        };
    
        try {
            const response = await fetch(apiEndpoint, requestOptions);
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`errorData.message || HTTP error! Status: ${response.status}`);
            }
    
            // Fetch and log the response data
            const responseData = await response.json();
            
            console.log('Contributors added:', responseData);
    
            console.log('Contributors updated successfully');
            setSelectedUsers([]);
            fetchUsers(); // Update the UI with the new list of contributors
            fetchContributors();
        } catch (error) {
            console.error('Error updating contributors:', error);
            setError(error);
        }
    };
    
    const handleRemoveAllContributors = async () => {
        const apiEndpoint = `/api/projects/${project.id}/remove_contributors/`; // Ensure this matches your Django URL configuration
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_ids: contributors.map(contributor => contributor.member_id) })
        };
    
        try {
            const response = await fetch(apiEndpoint, requestOptions);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            console.log('Contributors removed successfully');
            setSelectedUsers([]); // Reset selected users
            fetchUsers(); // Fetch the updated list of users
            fetchContributors(); // Fetch the updated list of contributors
        } catch (error) {
            console.error('Error removing contributors:', error);
            setError(error); // Set error to show error message to user
        }
    };
    

    

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="contribution-settings">
            <div className="contribution-settings__wrapper">
                <div className="contribution-settings__title">Contribution Settings</div>
    
                {/* User selection list */}
                <div className="user-list">
                    <ul className="contribution-settings__list">
                        {users.map(user => (
                            <li key={user.member_id}>
                                <input 
                                    type="checkbox"
                                    className="contribution-settings__checkbox"
                                    checked={selectedUsers.some(u => u.member_id === user.member_id)}
                                    onChange={() => handleCheckboxChange(user)} 
                                />
                                <span className="contribution-settings__user-name">
                                    {user.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
    
                {/* Selected user list */}
                <div className="selected-user-list">
                    <ul>
                        {selectedUsers.map(user => (
                            <li key={user.member_id}>{user.name}</li>
                        ))}
                    </ul>
                </div>
    
                {/* Add contributors button */}
                <button className="contribution-settings__button" onClick={handleButtonClick}>Add Selected to Contributors</button>
    
                {/* Contributors list */}
                <div className="contributor-list">
                    <h3>Current Contributors</h3>
                    {contributors.length > 0 ? (
                        <ul>
                            {contributors.map(contributor => (
                                <li key={contributor.member_id}>
                                    {contributor.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div>No contributors found</div>
                    )}
                </div>
    
                {/* Remove all contributors button */}
                {contributors.length > 0 && (
                    <button className="contribution-settings__button" onClick={handleRemoveAllContributors}>Remove All Contributors</button>
                )}
            </div>
        </div>
    );
};


ContributionSettings.menuItem = "Contribution";
ContributionSettings.path = "/contribution";
ContributionSettings.exact = true;