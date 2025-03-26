import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '../src/components/(AdminComponents)/adminDashboard';
import Notifications from  '../src/components/(AdminComponents)/notifications';

jest.mock('../src/components/(AdminComponents)/notifications', () => () => (
  <div data-testid="notifications">Notifications Component</div>
));

test('renders AdminDashboardPage with Notifications', () => {
  render(<AdminDashboardPage />);

  // Check if the Notifications component is rendered
  const notifications = screen.getByTestId('notifications');
  expect(notifications).toBeInTheDocument();
  expect(notifications).toHaveTextContent('Notifications Component');
});
