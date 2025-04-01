// src/components/StudentDashboard.test.tsx
import { render, act, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentDashboard from '../src/components/(StudentComponents)/studentDashboard';
import { UserProvider } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';

const TEST_USER = {
  email: 'email@gmail.com',
  password: 'password',
};

describe('StudentDashboard', () => {
  let supabase: ReturnType<typeof createClient>;

  // Start the supabase client before all tests begin.
  beforeAll(async () => {
    supabase = createClient();
  });
  // Log into the account before each test.
  beforeEach(async () => {
    await supabase.auth.signInWithPassword(TEST_USER);
  })
  // Log out current user.
  afterEach(async () => {
    await act(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.auth.signOut();
    });
  });

  it('checks for 13 EPA cards and related structure', async () => {
    const EPA_Component = () => {
      return (
        <div>
            <StudentDashboard />
        </div>
      )
    }
    const { container } = render(
      <UserProvider>
        <EPA_Component />
      </UserProvider>
    );

    // Verify actual EPA data appears
    await screen.findAllByText('EPA');
    const rowDiv = container.querySelector('.row');
    expect(rowDiv?.children.length).toBe(13);
    // Check for exactly 13 card containers
    const epaCards = rowDiv?.querySelectorAll('.col-md-4.mb-4');
    expect(epaCards).toHaveLength(13);

    // Verify each card's core structure
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    epaCards?.forEach((card, index) => {
      /* UNCOMMENT TO SEE EPA NUMBER AND TITLE */
      //console.log(`Card ${index+1}:`, card.textContent?.replace(/\s+/g, ' '));

      // Check card classes and styles
      expect(card).toHaveClass('col-md-4', 'mb-4');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabindex', '0');

      // Verify card content pattern
      const cardContent = card.textContent;
      expect(cardContent).toMatch(/EPA\d+/);
      
      // Check for the SVG gauge
      const svg = card.querySelector('svg[role="img"]');
      expect(svg).toBeInTheDocument();
    });
  });
  it('switches active time range and updates EPA cards', async () => {
    render(<StudentDashboard />);
    
    // Wait for initial load
    await screen.findAllByText('EPA');

    // Verify initial 3-month range is active
    const threeMonthBtn = screen.getByText('Last 3 mo');
    expect(threeMonthBtn).toHaveClass('active');
    expect(threeMonthBtn).toHaveClass('btn-outline-primary');

    // Switch to 6-month range
    const sixMonthBtn = screen.getByText('Last 6 mo');
    fireEvent.click(sixMonthBtn);

    // Verify UI update
    await waitFor(() => {
      expect(sixMonthBtn).toHaveClass('active');
      expect(threeMonthBtn).not.toHaveClass('active');
    });

    // Switch to 12-month range
    const twelveMonthBtn = screen.getByText('Last 12 mo');
    fireEvent.click(twelveMonthBtn);

    // Verify UI update
    await waitFor(() => {
      expect(twelveMonthBtn).toHaveClass('active');
      expect(sixMonthBtn).not.toHaveClass('active');
    });
  });
});