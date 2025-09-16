/**
 * AUTH SYSTEM TESTING UTILITIES
 * Manual testing helpers for the new role-based auth system
 */

'use client';

import { useState } from 'react';
import { User, UserRole, ROLE_PERMISSIONS } from '@/types/auth.types';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGate } from '@/components/auth';

// Mock users for testing different roles
const MOCK_USERS: Record<UserRole, User> = {
  platform_admin: {
    id: 1,
    name: 'Platform Admin',
    email: 'admin@platform.com',
    role: 'platform_admin',
    organization: { id: 1, name: 'Platform Organization' },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  entity_admin: {
    id: 2,
    name: 'Entity Admin',
    email: 'admin@entity.com',
    role: 'entity_admin',
    organization: { id: 2, name: 'Test Entity' },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  entity_staff: {
    id: 3,
    name: 'Entity Staff',
    email: 'staff@entity.com',
    role: 'entity_staff',
    organization: { id: 2, name: 'Test Entity' },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
  organizer_admin: {
    id: 4,
    name: 'Event Organizer',
    email: 'organizer@events.com',
    role: 'organizer_admin',
    organization: { id: 3, name: 'Event Organization' },
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
  },
};

// Test results interface
interface TestResult {
  test: string;
  expected: boolean;
  actual: boolean;
  passed: boolean;
}

// Permission tests for each role
const PERMISSION_TESTS = [
  { role: 'platform_admin', permission: 'manage_users', expected: true },
  { role: 'platform_admin', permission: 'manage_events', expected: true },
  { role: 'platform_admin', permission: 'access_admin', expected: true },
  
  { role: 'entity_admin', permission: 'manage_users', expected: true },
  { role: 'entity_admin', permission: 'manage_events', expected: true },
  { role: 'entity_admin', permission: 'access_admin', expected: true },
  
  { role: 'entity_staff', permission: 'manage_users', expected: false },
  { role: 'entity_staff', permission: 'manage_events', expected: true },
  { role: 'entity_staff', permission: 'access_admin', expected: true },
  
  { role: 'organizer_admin', permission: 'manage_users', expected: false },
  { role: 'organizer_admin', permission: 'manage_events', expected: true },
  { role: 'organizer_admin', permission: 'access_admin', expected: false },
];

export const AuthSystemTest = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('platform_admin');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  const { user } = useAuth();
  const {
    hasRole,
    can,
    isAdmin,
    isPlatformAdmin,
    isEntityAdmin,
    isStaff,
    isOrganizer,
    canManageEvents,
    canApproveEvents,
    canAccessAdmin,
    canManageUsers,
    getUserPermissions,
  } = usePermissions();

  // Mock user setter (in real app, this would come from login)
  const setMockUser = (role: UserRole) => {
    setSelectedRole(role);
    // In a real scenario, you would set this through the actual auth system
    // For testing, we'll just update the selected role
  };

  // Run permission tests
  const runPermissionTests = () => {
    const results: TestResult[] = [];
    
    // Test role-based permissions
    PERMISSION_TESTS.forEach(test => {
      const mockUser = MOCK_USERS[test.role as UserRole];
      const userPermissions = ROLE_PERMISSIONS[mockUser.role];
      const hasPermission = userPermissions.includes(test.permission as any);
      
      results.push({
        test: `${test.role} should ${test.expected ? 'have' : 'not have'} ${test.permission}`,
        expected: test.expected,
        actual: hasPermission,
        passed: test.expected === hasPermission,
      });
    });
    
    setTestResults(results);
  };

  // Get current user info for display
  const currentUser = user || MOCK_USERS[selectedRole];
  const permissions = getUserPermissions();

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Auth System Testing</h1>
      
      {/* Role Selector */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Test Role Selection</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(MOCK_USERS).map(role => (
            <button
              key={role}
              onClick={() => setMockUser(role as UserRole)}
              className={`p-3 rounded border text-left ${
                selectedRole === role
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <div className="font-medium">{role.replace('_', ' ').toUpperCase()}</div>
              <div className="text-sm text-gray-500">
                {MOCK_USERS[role as UserRole].name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current User Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role?.role_name}</p>
            <p><strong>Organization:</strong> {currentUser.organization?.name}</p>
          </div>
          <div>
            <p><strong>Permissions:</strong></p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {permissions.map(permission => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Role Checks */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Role Checks</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Basic Role Checks:</h3>
            <ul className="space-y-1 text-sm">
              <li>hasRole('{selectedRole}'): {String(hasRole(selectedRole))}</li>
              <li>isAdmin(): {String(isAdmin())}</li>
              <li>isPlatformAdmin(): {String(isPlatformAdmin())}</li>
              <li>isEntityAdmin(): {String(isEntityAdmin())}</li>
              <li>isStaff(): {String(isStaff())}</li>
              <li>isOrganizer(): {String(isOrganizer())}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Feature Access:</h3>
            <ul className="space-y-1 text-sm">
              <li>canManageEvents(): {String(canManageEvents())}</li>
              <li>canApproveEvents(): {String(canApproveEvents())}</li>
              <li>canAccessAdmin(): {String(canAccessAdmin())}</li>
              <li>canManageUsers(): {String(canManageUsers())}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Permission Gate Tests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Permission Gate Tests</h2>
        <div className="space-y-4">
          <PermissionGate
            permission="manage_events"
            fallback={<div className="text-red-500 p-2 bg-red-50 rounded">❌ No access to event management</div>}
          >
            <div className="text-green-500 p-2 bg-green-50 rounded">✅ Can manage events</div>
          </PermissionGate>
          
          <PermissionGate
            permission="manage_users"
            fallback={<div className="text-red-500 p-2 bg-red-50 rounded">❌ No access to user management</div>}
          >
            <div className="text-green-500 p-2 bg-green-50 rounded">✅ Can manage users</div>
          </PermissionGate>
          
          <PermissionGate
            roles={['platform_admin', 'entity_admin']}
            fallback={<div className="text-red-500 p-2 bg-red-50 rounded">❌ Admin access required</div>}
          >
            <div className="text-green-500 p-2 bg-green-50 rounded">✅ Admin access granted</div>
          </PermissionGate>
          
          <PermissionGate
            resource="admin"
            fallback={<div className="text-red-500 p-2 bg-red-50 rounded">❌ No admin panel access</div>}
          >
            <div className="text-green-500 p-2 bg-green-50 rounded">✅ Admin panel accessible</div>
          </PermissionGate>
        </div>
      </div>

      {/* Automated Tests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Automated Permission Tests</h2>
        <button
          onClick={runPermissionTests}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Run Tests
        </button>
        
        {testResults.length > 0 && (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded text-sm ${
                  result.passed
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="font-medium">
                  {result.passed ? '✅ PASS' : '❌ FAIL'}: {result.test}
                </div>
                <div className="text-xs mt-1">
                  Expected: {String(result.expected)}, Got: {String(result.actual)}
                </div>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <strong>Summary:</strong> {testResults.filter(r => r.passed).length} passed, {testResults.filter(r => !r.passed).length} failed out of {testResults.length} tests
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSystemTest;