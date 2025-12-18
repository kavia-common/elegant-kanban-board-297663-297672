import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Kanban Board application', () => {
  render(<App />);
  const titleElement = screen.getByText(/Kanban Board/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders new board button', () => {
  render(<App />);
  const newBoardButton = screen.getByText(/New Board/i);
  expect(newBoardButton).toBeInTheDocument();
});
