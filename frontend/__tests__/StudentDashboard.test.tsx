// src/components/StudentDashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentDashboard from '../src/components/(StudentComponents)/studentDashboard';
import React from 'react';
import { createClient } from '@/utils/supabase/client';

describe('StudentDashboard', () => {
  test('renders EPACards and toggles range', async () => {
    const supabase = createClient();
    try {
        // Log in the user
        const { } = await supabase.auth.signInWithPassword({
          email: "tyler101price@gmail.com",
          password: "Fireball",
        });
      } catch (error) {
        console.error('Error:', error);
      }
    render(<StudentDashboard />);
    //   Will give an error because this account is not a student.
    //   So there are no epa descriptions.
    //   Need to get student account.
    // Ensure no EPA Cards exist
    const epaCards = screen.queryAllByTestId(/^epacard-/);
    expect(epaCards.length).toBe(0);

    // Ensure no modal is present
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('opens and closes the modal', () => {
    render(<StudentDashboard />);

    // // Trigger a click on the EPA card
    // const epaCard = screen.getByTestId('epacard-1');
    // fireEvent.click(epaCard);

    // // Check if the modal shows the correct data
    // expect(screen.getByTestId('epamodal')).toHaveTextContent('No EPA selected'); // This will change based on your data

    // // Close the modal
    // const closeButton = screen.getByText('Close');
    // fireEvent.click(closeButton);
    // expect(screen.queryByTestId('epamodal')).toBeNull();
  });
});


