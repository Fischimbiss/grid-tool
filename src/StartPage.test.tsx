import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StartPage from './StartPage';
import { UserProvider } from './context/UserContext';

test('renders role selector', () => {
  render(
    <MemoryRouter>
      <UserProvider>
        <StartPage onSelectSystem={() => {}} />
      </UserProvider>
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/Rolle/i)).toBeInTheDocument();
});
