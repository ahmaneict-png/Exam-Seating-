
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-blue-600">
        Exam Seating Arrangement Generator
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Automate room and seat allocation for examinations with ease.
      </p>
    </header>
  );
};

export default Header;
