// import React from 'react';
// export const ModelListDropdown = ({ models, onSelectModel }) => {
//   const handleSelectModel = (event) => {
//     const selectedModelTitle = event.target.value;
//     const selectedModel = models.find((model) => model.title === selectedModelTitle);

//     onSelectModel(selectedModel); // Pass the entire selected model object
//   };
  
//   return (
//     // <select 
//     //   aria-label="Select Model" 
//     //   onChange={handleSelectModel}
//     //   defaultValue="" // Set the default value to an empty string
//     // >
//     //   <option value="" disabled hidden>Select Model</option>
//     //   {models.map((model) => (
//     //     <option key={ model.title} value={model.title}>
//     //       {model.title}
//     //     </option>
//     //   ))}
//     // </select>
//     <select 
//       aria-label="Select Model" 
//       onChange={handleSelectModel}
//       value={selectedModel || ''} // Ensure this is controlled by a state variable
//     >
//       <option value="" disabled>Select Model</option>
//       {models.map((model) => (
//         <option key={model.title} value={model.title}>
//           {model.title}
//         </option>
//       ))}
//     </select>

//   );
// };

// ModelListDropdown.js
import React from 'react';
import { MdOutlineReplay } from 'react-icons/md';

export const ModelListDropdown = ({ models, selectedModelTitle, onSelectModel, onReset }) => {
  const handleSelectModel = (event) => {
    const selectedModelTitle = event.target.value;
    const selectedModel = models.find((model) => model.title === selectedModelTitle);

    onSelectModel(selectedModel); // Pass the entire selected model object
  };

  
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <select 
        aria-label="Select Model" 
        onChange={handleSelectModel}
        value={selectedModelTitle || ''}
        style={{ width: '100%', height: '35px' }}
      >
        <option value="" disabled>Select Model</option>
        {models.map((model) => (
          <option key={model.title} value={model.title}>
            {model.title}
          </option>
        ))}
      </select>
      {/* <button onClick={handleReset} style={{ height: '35px', display: 'flex', alignItems: 'center' }}><MdOutlineReplay/> Reset</button> */}
    </div>
  );
};

  
  