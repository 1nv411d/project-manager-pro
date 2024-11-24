import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Projects from './Projects';
import { tenantService } from '../services/TenantService';

jest.mock('../services/TenantService');

describe('Projects Component', () => {
  const mockProjects = [
    {
      id: 1,
      name: 'Test Project',
      description: 'Test Description',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2024-12-31'
    }
  ];

  beforeEach(() => {
    tenantService.getCurrentTenant.mockReturnValue({
      id: 'test_com',
      name: 'Test Company'
    });
    tenantService.getData.mockReturnValue(mockProjects);
  });

  test('renders project list', () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  test('can add new project', async () => {
    render(
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Add Project'));

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: 'New Project' }
    });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(tenantService.setData).toHaveBeenCalled();
    });
  });
}); 