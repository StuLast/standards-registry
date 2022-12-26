import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import Link from '../index';

describe('Link component', () => {
  it('should render a link with the text argument in the object', () => {
    const props = {
      href: 'http://some-website/',
      text: 'test link',
    };
    render(<Link {...props} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', props.href);
    expect(screen.getByText(props.text)).toBeInTheDocument();
  });

  it('should render a link with a href path only', () => {
    const props = {
      href: 'http://some-website/',
    };
    render(<Link {...props} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', props.href);
    expect(screen.getByText(props.href)).toBeInTheDocument();
  });

  it('should render a link with a child component', () => {
    const props = {
      href: 'http://some-website/',
    };
    render(<Link {...props}> The Link </Link>);

    expect(screen.getByRole('link')).toHaveAttribute('href', props.href);
    expect(screen.getByText('The Link')).toBeInTheDocument();
  });

  it('should render a link with a target of _blank', () => {
    const props = {
      href: 'http://some-website/',
      newWindow: true,
    };
    render(<Link {...props}> The Link </Link>);

    expect(screen.getByRole('link')).toHaveAttribute('href', props.href);
    expect(screen.getByText('The Link')).toHaveAttribute('target', '_blank');
  });

  it('should have a class of myLink in the rendered component', () => {
    const props = {
      href: 'http://some-website/',
      className: 'myLink',
    };
    render(<Link {...props}> The Link </Link>);

    expect(screen.getByRole('link')).toHaveAttribute('href', props.href);
    expect(screen.getByRole('link')).toHaveAttribute('class', props.className);
  });
});
