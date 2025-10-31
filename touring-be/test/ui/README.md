// test/ui/README.md
# UI Tests (Optional)

UI tests focus on testing the frontend user interface.
These tests verify user interactions, component rendering, and user experience.

## Technologies for UI Testing
- **React Testing Library**: Component testing
- **Jest**: Test runner
- **User Event**: Simulating user interactions
- **Playwright/Cypress**: End-to-end testing (optional)

## Example UI Test Structure

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourCard } from '../../src/components/TourCard';

describe('TourCard Component', () => {
  it('should display tour information', () => {
    const mockTour = {
      id: '1',
      name: 'Ha Long Bay Tour',
      price: 100,
      duration: '2 days'
    };

    render(<TourCard tour={mockTour} />);

    expect(screen.getByText('Ha Long Bay Tour')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('2 days')).toBeInTheDocument();
  });

  it('should call onBook when book button is clicked', () => {
    const mockOnBook = jest.fn();
    const mockTour = { id: '1', name: 'Test Tour' };

    render(<TourCard tour={mockTour} onBook={mockOnBook} />);

    const bookButton = screen.getByRole('button', { name: /book/i });
    fireEvent.click(bookButton);

    expect(mockOnBook).toHaveBeenCalledWith('1');
  });
});
```

## Current Status
- Not implemented yet
- Requires frontend testing setup
- Optional for backend-focused testing