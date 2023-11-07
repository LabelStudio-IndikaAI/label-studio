import React from 'react';
export const ModelListDropdown = ({ models, onSelectModel }) => {
  const handleSelectModel = (event) => {
    const selectedModelTitle = event.target.value;
    const selectedModel = models.find((model) => model.title === selectedModelTitle);

    onSelectModel(selectedModel); // Pass the entire selected model object
  };
  
  return (
    <select 
      aria-label="Select Model" 
      onChange={handleSelectModel}
      defaultValue="" // Set the default value to an empty string
    >
      <option value="" disabled hidden>Select Model</option>
      {models.map((model) => (
        <option key={ model.title} value={model.title}>
          {model.title}
        </option>
      ))}
    </select>
  );
};
  
  