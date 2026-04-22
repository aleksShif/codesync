import React from 'react';
import { AvatarGroup } from './AvatarGroup';

export function ViewerStack({ users }) {
  // Hide the stack completely if 1 or fewer users are present
  if (!users || users.length <= 1) return null;

  return (
    <div className="flex items-center space-x-4">
      <span style={{ fontSize: 13, fontWeight: 600, color: '#ededed', letterSpacing: '0.02em' }}>
        Live users
      </span>
      
      {/* Delegate the interactive avatars to the modular component */}
      <AvatarGroup users={users} maxDisplay={3} size="md" />
    </div>
  );
}