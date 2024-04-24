// BootstrapClient.tsx
// This component imports and initializes Bootstrap's JavaScript bundle using useEffect to ensure
// the Bootstrap functionalities are available throughout the React application. It loads the 
// bootstrap.bundle.min.js file when the component mounts and does not render any visual content.

"use client"

import { useEffect } from 'react';

function BootstrapClient() {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
}

export default BootstrapClient;