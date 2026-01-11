import '@testing-library/jest-dom';

import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../pages/Login'; // Ton Login
import { BrowserRouter } from 'react-router-dom';

// Test 1 : Formulaire s'affiche
test('affiche formulaire login', () => {
  render(<Login />, { wrapper: BrowserRouter });
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Mot de passe')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Se connecter' })).toBeInTheDocument();
});

// Test 2 : Remplit les champs
test('remplit email et mot de passe', async () => {
  render(<Login />, { wrapper: BrowserRouter });
  
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'test@test.com' }
  });
  
  fireEvent.change(screen.getByPlaceholderText('Mot de passe'), {
    target: { value: '123456' }
  });
  
  expect(screen.getByDisplayValue('test@test.com')).toBeInTheDocument();
  expect(screen.getByDisplayValue('123456')).toBeInTheDocument();
});

// Test 3 : Soumet le formulaire
test('soumet le formulaire', async () => {
  const mockLogin = jest.fn();
  // Mock ton useAuth pour tester
  jest.mock('../auth/AuthContext', () => ({
    useAuth: () => ({ login: mockLogin })
  }));
  
  render(<Login />, { wrapper: BrowserRouter });
  fireEvent.click(screen.getByRole('button'));
  
  expect(mockLogin).toHaveBeenCalled();
});
