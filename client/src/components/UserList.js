import React from 'react';

function UserList({ users, currentUser, setCurrentUser }) {
  return (
    <div className="p-5">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Users</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current User:
        </label>
        <input
          type="text"
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary"
        />
      </div>
      
      {users && users.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-2 text-gray-700">Online Users:</h4>
          <ul className="space-y-1">
            {users.map((user, index) => (
              <li
                key={index}
                className="p-2 bg-white rounded border border-gray-200 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
              >
                {user.username || user.name || `User ${index + 1}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default UserList;