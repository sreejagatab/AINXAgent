import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/utils';
import { UserProfile } from './UserProfile';
import { server } from '../../test/setup';
import { rest } from 'msw';
import { getEnvironment } from '../../config/environment';

const baseUrl = getEnvironment().API_URL;

describe('UserProfile', () => {
  it('renders profile form with user data', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
      expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User');
    });
  });

  it('handles form submission successfully', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/username/i));
    await user.type(screen.getByLabelText(/username/i), 'newusername');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('handles form submission error', async () => {
    server.use(
      rest.put(`${baseUrl}/api/users/profile`, (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({
            success: false,
            error: 'Username already taken',
          })
        );
      })
    );

    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/username/i));
    await user.type(screen.getByLabelText(/username/i), 'existinguser');

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
    });
  });

  it('validates form fields', async () => {
    const user = userEvent.setup();
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/username/i));
    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
    });
  });
}); 