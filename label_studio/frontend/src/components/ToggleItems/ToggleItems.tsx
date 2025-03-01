// import React, { CSSProperties, useState } from "react";
// import { cn } from "../../utils/bem";
// import "./ToggleItems.styl";

// export const ToggleItems = ({
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
//   const rootClass = cn('toggle-items');
//   const [isExpanded, setIsExpanded] = useState(false);

//   const handleToggleClick = () => {
//     setIsExpanded(!isExpanded);
//   };

//   return (
//     <div className={rootClass.mod({ big }).mix(className).toString()} style={style}>
//       <button className={rootClass.elem("toggle-button").toString()} onClick={handleToggleClick}>
//         {isExpanded ? '▲' : '▼'}
//       </button>
//       {isExpanded && (
//         <ul>
//           {Object.keys(items).map(item => (
//             <li
//               key={item}
//               className={rootClass.elem("item").mod({ active: item === active }).toString()}
//               onClick={() => onSelect(item)}
//             >
//               {items[item]}
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

export const ToggleItems = ({ className, style, big, items, active, onSelect }: {
  className: string,
  style?: CSSProperties,
  big?: boolean,
  items: { [name: string]: string },
  active: string,
  onSelect: (name: string) => any,
}) => {
  const rootClass = cn('toggle-items');

  return (
    <ul className={rootClass.mod({ big }).mix(className).toString()} style={style}>
      {Object.keys(items).map(item => (
        <li
          key={item}
          className={rootClass.elem("item").mod({ active: item === active }).toString()}
          onClick={() => onSelect(item)}
        >{items[item]}</li>
      ))}
    </ul>
  );
};




