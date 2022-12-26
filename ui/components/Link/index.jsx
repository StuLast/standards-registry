import React, { Fragment, FC } from 'react';

function Link({ href, text, newWindow = false, className, children }) {
  return (
    <Fragment>
      <a
        target={newWindow ? '_blank' : '_self'}
        href={href}
        rel="noreferrer"
        className={className}
      >
        {text || children || href}
      </a>
    </Fragment>
  );
}
export default Link;
