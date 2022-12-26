import React from 'react';

interface iLink {
  href: string;
  text?: string;
  newWindow?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function Link({
  href,
  text,
  newWindow = false,
  className,
  children,
}: iLink): JSX.Element {
  return (
    <a
      target={newWindow ? '_blank' : '_self'}
      href={href}
      rel="noreferrer"
      className={className}
    >
      {text || children || href}
    </a>
  );
}
export default Link;
