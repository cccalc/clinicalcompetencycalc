import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from "../src/app/dashboard/page";
import { act } from 'react';
import { mockUserContext } from "../__mocks__/UserContextMock";

// Mock the dashboard components to avoid importing them
jest.mock('@/components/(AdminComponents)/adminDashboard', () => {
  const MockAdminDashboard = () => <div data-testid="admin-dashboard">Admin Dashboard</div>;
  MockAdminDashboard.displayName = 'MockAdminDashboard';
  return MockAdminDashboard;
});
jest.mock('@/components/(RaterComponents)/raterDashboard', () => {
  const MockRaterDashboard = () => <div data-testid="rater-dashboard">Rater Dashboard</div>;
  MockRaterDashboard.displayName = 'MockRaterDashboard';
  return MockRaterDashboard;
});
jest.mock('@/components/(StudentComponents)/studentDashboard', () => {
  const MockStudentDashboard = () => <div data-testid="student-dashboard">Student Dashboard</div>;
  MockStudentDashboard.displayName = 'MockStudentDashboard';
  return MockStudentDashboard;
});

describe('Dashboard Component', () => {
  test('renders Admin Dashboard for authorized users', async () => {
    const MockProvider = mockUserContext({ userRoleAuthorized: true, userRoleRater: false, userRoleStudent: false, userRoleDev: false, displayName: 'Test Admin' });
        await act (async () => {
        render(
        <MockProvider>
            <Dashboard />
        </MockProvider>
        );
    });
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
  });

  test('renders Rater Dashboard for raters', async () => {
    const MockProvider = mockUserContext({ userRoleAuthorized: false, userRoleRater: true, userRoleStudent: false, userRoleDev: false, displayName: 'Test Rater' });

    await act(async () => {
        render(
        <MockProvider>
            <Dashboard />
        </MockProvider>
        );
    });

    expect(screen.getByTestId('rater-dashboard')).toBeInTheDocument();
  });

  test('renders Student Dashboard for students', async () => {
    const MockProvider = mockUserContext({ userRoleAuthorized: false, userRoleRater: false, userRoleStudent: true, userRoleDev: false, displayName: 'Test Student' });

    await act(async () => {
        render(
        <MockProvider>
            <Dashboard />
        </MockProvider>
        );
    });

    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
  });

  test('renders Developer toggle and can switch views', async () => {
    const MockProvider = mockUserContext({ userRoleAuthorized: false, userRoleRater: false, userRoleStudent: false, userRoleDev: true, displayName: 'Test Dev' });

    await act(async () => {
        render(
        <MockProvider>
            <Dashboard />
        </MockProvider>
        );
    });

    // Check initial state (default: admin)
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();

    // Switch to Rater Dashboard
    await act(async () => {
        fireEvent.change(screen.getByLabelText('Developer View:'), { target: { value: 'rater' } });
    });
    expect(screen.getByTestId('rater-dashboard')).toBeInTheDocument();

    // Switch to Student Dashboard
    await act(async () => {
        fireEvent.change(screen.getByLabelText('Developer View:'), { target: { value: 'student' } });
    });
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
  });
});
