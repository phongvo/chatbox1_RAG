import React from 'react';
import './UserList.css';

const UserList = ({ users, currentUser, setCurrentUser }) => {
  return (
    <div className="user-list">
      <h3>Users</h3>
      <div className="current-user">
        <strong>Current: {currentUser}</strong>
      </div>
      <div className="users">
        {users.map((user) => (
          <div
            key={user._id}
            className={`user-item ${currentUser === user.username ? 'active' : ''}`}
            onClick={() => setCurrentUser(user.username)}
          >
            <div className="user-avatar">
              {user.avatar || user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.username}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;