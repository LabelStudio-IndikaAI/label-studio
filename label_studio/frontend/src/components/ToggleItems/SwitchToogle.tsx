// import React, { CSSProperties, useState } from "react";
// import { cn } from "../../utils/bem";
// import "./ToggleItems.styl";

// // Create a new component with the same structure and styling
// export const SwitchToggle = ({
//   className,
//   style,
//   big,
//   items,
//   active,
//   onSelect,
// }: {
//   className: string;
//   style?: CSSProperties;
//   big?: boolean;
//   items: { [name: string]: string };
//   active: string;
//   onSelect: (name: string) => any;
// }) => {
//   const rootClass = cn('toggle-items'); // Keep using the same class name
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleToggleClick = () => {
//     setIsExpanded(!isExpanded);
//   };

//   return (
//     <div className={rootClass.mod({ big }).mix(className).toString()} style={style}>
//       <button className={rootClass.elem("toggle-button").toString()} onClick={handleToggleClick}>
//         {isExpanded ? '▼' : '▲'} Change the button text to '▼' and '▲'
//       </button>
//       {isExpanded && (
//         <ul>
//           {Object.keys(items).map(option => (
//             <li
//               key={option}
//               className={rootClass.elem("item").mod({ active: option === active }).toString()}
//               onClick={() => onSelect(option)}
//             >
//               {items[option]}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };



import React, { CSSProperties } from "react";
import { cn } from "../../utils/bem";
import "./ToggleItems.styl";

// Create a new component to display the list by default
export const SwitchToggle = ({
  className,
  style,
  big,
  items,
  active,
  onSelect,
}: {
  className: string;
  style?: CSSProperties;
  big?: boolean;
  items: { [name: string]: string };
  active: string;
  onSelect: (name: string) => any;
}) => {
  const rootClass = cn('toggle-items'); // Keep using the same class name

  return (
    <div className={`${rootClass.mod({ big }).mix(className).toString()}`} style={style}>
      <div className={`${rootClass.elem("item-container")}`}>
        {Object.keys(items).map(option => (
          <button
            key={option}
            className={rootClass.elem("item").mod({ active: option === active }).toString()}
            onClick={() => onSelect(option)}
          >
            {items[option]}
          </button>
        ))}
      </div>
    </div>
  );
};
