import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="mobile-viewport relative overflow-hidden">
            {children}
        </div>
    );
};

export default Layout;
