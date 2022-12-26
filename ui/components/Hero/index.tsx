import React from 'react';

interface iHero {
  children: React.ReactNode;
}

export default function Hero({ children }: iHero): JSX.Element {
  return (
    <section className="nhsuk-hero">
      <div className="nhsuk-width-container">
        <div className="nhsuk-hero__wrapper">{children}</div>
      </div>
    </section>
  );
}
