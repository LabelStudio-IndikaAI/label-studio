<<<<<<< HEAD
=======
// import React from 'react';
// import { cn } from '../../utils/bem';
// import './Spinner.styl';

// export const Spinner = ({ className, style, size = 32, stopped = false }) => {
//   const rootClass = cn('spinner');

//   const sizeWithUnit = typeof size === 'number' ? `${size}px` : size;

//   return (
//     <div className={rootClass.mix(className)} style={{ ...(style ?? {}), '--spinner-size': sizeWithUnit }}>
//       <div className={rootClass.elem('body').mod({ stopped })}>
//         <span/>
//         <span/>
//         <span/>
//         <span/>
//       </div>
//     </div>
//   );
// };

>>>>>>> 2ff07b6ec650386ec782772175e0c03ab33e9a82
// import React from 'react';
// import { cn } from '../../utils/bem';
// import './Spinner.styl';

// export const Spinner = ({ className, style, size = 32, stopped = false }) => {
//   const rootClass = cn('spinner');
<<<<<<< HEAD

//   const sizeWithUnit = typeof size === 'number' ? `${size}px` : size;
=======
  
//   const containerStyle = {
//     width: `${size}px`,
//     height: `${size}px`,
//     position: 'relative',
//     ...style,
//   };

//   const spinnerStyle = {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     backgroundImage: `url(${spinnerImage})`, // replace with your image path
//     backgroundSize: 'contain',
//     backgroundRepeat: 'no-repeat',
//     animation: stopped ? 'none' : 'spin 1s linear infinite',
//   };
>>>>>>> 2ff07b6ec650386ec782772175e0c03ab33e9a82

//   return (
//     <div className={rootClass.mix(className)} style={{ ...(style ?? {}), '--spinner-size': sizeWithUnit }}>
//       <div className={rootClass.elem('body').mod({ stopped })}>
//         <span/>
//         <span/>
//         <span/>
//         <span/>
//       </div>
//     </div>
//   );
// };

<<<<<<< HEAD
import React from 'react';
import { cn } from '../../utils/bem';
import './Spinner.styl';
import spinnerImage from './favicon.jpg';

export const Spinner = ({ className, style, size = 32, stopped = false }) => {
  const rootClass = cn('spinner');
  
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    position: 'relative',
    ...style
  };

  const spinnerStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundImage: `url(${spinnerImage})`, // replace with your image path
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    animation: stopped ? 'none' : 'spin 1s linear infinite'
  };

  return (
    <div className={rootClass.mix(className)} style={containerStyle}>
      <div style={spinnerStyle} />
    </div>
  );
};
=======

import React from 'react';
import { cn } from '../../utils/bem';
import './Spinner.styl';
export const Spinner = ({ className, style, size = 32, stopped = false }) => {
  const rootClass = cn('spinner');
  const sizeWithUnit = typeof size === 'number' ? `${size}px` : size;
  
  return (
    <div className={rootClass.mix(className)} style={{ ...(style ?? {}), '--spinner-size': sizeWithUnit }}>
      <div className={rootClass.elem('body').mod({ stopped })}>
        <div className={rootClass.elem('bar')}></div>
        <div className={rootClass.elem('bar')}></div>
        <div className={rootClass.elem('bar')}></div>
      </div>
    </div>
  );
};
>>>>>>> 2ff07b6ec650386ec782772175e0c03ab33e9a82
