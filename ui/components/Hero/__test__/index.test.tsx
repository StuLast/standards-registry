import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import Hero from '../index';

describe('Hero component', () => {
  it('should render a Hero component with the passed in child elements', () => {
    const childComponentText = 'my child component';
    render(
      <Hero>
        <p>{childComponentText}</p>
      </Hero>
    );

    expect(screen.getByText(childComponentText)).toBeInTheDocument();
  });
});
