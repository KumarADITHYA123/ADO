import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
}));

// Mock fetch
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({
        title: "Test Scenario",
        actions: [],
        threats: []
      })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders main title', () => {
    render(<App />);
    const titleElement = screen.getByText(/Adaptive Deception Orchestrator/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders attacker beliefs section', () => {
    render(<App />);
    const beliefsElement = screen.getByText(/Attacker Beliefs/i);
    expect(beliefsElement).toBeInTheDocument();
  });

  test('renders simulation status section', () => {
    render(<App />);
    const statusElement = screen.getByText(/Simulation Status/i);
    expect(statusElement).toBeInTheDocument();
  });

  test('renders mathematical transparency section', () => {
    render(<App />);
    const mathElement = screen.getByText(/Mathematical Transparency/i);
    expect(mathElement).toBeInTheDocument();
  });

  test('renders available actions section', () => {
    render(<App />);
    const actionsElement = screen.getByText(/Available Actions/i);
    expect(actionsElement).toBeInTheDocument();
  });

  test('renders turn log section', () => {
    render(<App />);
    const logElement = screen.getByText(/Turn Log/i);
    expect(logElement).toBeInTheDocument();
  });

  test('renders export button', () => {
    render(<App />);
    const exportButton = screen.getByText(/Export Simulation Report/i);
    expect(exportButton).toBeInTheDocument();
  });
});
