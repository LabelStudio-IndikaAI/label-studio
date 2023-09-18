import React from 'react';
import { cn } from '../../utils/bem';
import './Spinner.styl';

export const Spinner = ({ className, style, size = 32, stopped = false }) => {
  const rootClass = cn('spinner');

  const sizeWithUnit = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={rootClass.mix(className)} style={{ ...(style ?? {}), '--spinner-size': sizeWithUnit }}>
      <div className={rootClass.elem('body').mod({ stopped })}>
        <span/>
        <span/>
        <span/>
        <span/>
      </div>
    </div>
  );
};

// import React from 'react';
// import { cn } from '../../utils/bem';
// import './Spinner.styl';
// import spinnerImage from './favicon.jpg';

// export const Spinner = ({ className, style, size = 32, stopped = false }) => {
//   const rootClass = cn('spinner');
  
//   const containerStyle = {
//     width: `${size}px`,
//     height: `${size}px`,
//     position: 'relative',
//     ...style
//   };

//   const spinnerStyle = {
//     width: '100%',
//     height: '100%',
//     position: 'absolute',
//     backgroundImage: `url(${spinnerImage})`, // replace with your image path
//     backgroundSize: 'contain',
//     backgroundRepeat: 'no-repeat',
//     animation: stopped ? 'none' : 'spin 1s linear infinite'
//   };

//   return (
//     <div className={rootClass.mix(className)} style={containerStyle}>
//       <div style={spinnerStyle} />
//     </div>
//   );
// };
