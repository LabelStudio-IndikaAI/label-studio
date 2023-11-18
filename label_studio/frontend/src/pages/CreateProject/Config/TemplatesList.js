import React from 'react';
import { Spinner } from '../../../components';
import { useAPI } from '../../../providers/ApiProvider';
import { cn } from '../../../utils/bem';
import './Config.styl';
// import { FaImages } from "react-icons/fa6";
// import { GiArtificialIntelligence, GiBrain } from "react-icons/gi";
// import { AiFillAudio } from "react-icons/ai";
// import { HiOutlineChatAlt } from "react-icons/hi";
// import { MdDashboard, MdOutlineBarChart, MdOutlineVideocam } from "react-icons/md";
// import { IoIosTimer } from "react-icons/io";







const listClass = cn("templates-list");



const TemplatesInGroup = ({ templates, group, onSelectRecipe }) => {
  const picked = templates
    .filter(recipe => recipe.group === group)
    // templates without `order` go to the end of the list
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

  return (
    <ul>
      {picked.map(recipe => (
        <li
          key={recipe.title}
          onClick={() => onSelectRecipe(recipe)}
          className={listClass.elem("template")}
        >
          <img src={recipe.image} />
          <h3>{recipe.title}</h3>
        </li>
      ))}
    </ul>
  );
};

export const TemplatesList = ({ selectedGroup, selectedRecipe, onCustomTemplate, onSelectGroup, onSelectRecipe }) => {
  const [groups, setGroups] = React.useState([]);
  const [templates, setTemplates] = React.useState();
  const api = useAPI();

  React.useEffect(async () => {
    const res = await api.callApi('configTemplates');

    if (!res) return;
    const { templates, groups } = res;

    setTemplates(templates);
    setGroups(groups);
  }, []);

  const selected = selectedGroup || groups[0];

  // const groupIcons = {
  //   'Images': FaImages,
  //   'Brain': GiBrain,
  //   'Audio': AiFillAudio,
  //   'Chat': HiOutlineChatAlt,
  //   'BarChart': MdOutlineBarChart,
  //   'Dashboard': MdDashboard,
  //   'Timer': IoIosTimer,
  //   'Videocam': MdOutlineVideocam,
  //   'AI': GiArtificialIntelligence,
  // };
  

  return (
    <div className={listClass}>
      <aside className={listClass.elem("sidebar")}>
        <ul>
          {groups.map(group => (
            <li
              key={group}
              onClick={() => onSelectGroup(group)}
              className={listClass.elem("group").mod({
                active: selected === group,
                selected: selectedRecipe?.group === group,
              })}
            >
              {group}
              
            </li>
          ))}
        </ul>
        {/* <button type="button" onClick={onCustomTemplate} className={listClass.elem("custom-template")}>Custom template</button> */}
      </aside>
      <main>
        {!templates && <Spinner style={{ width: "100%", height: 200 }} />}
        {/* {!templates && <Spinner />} */}
        <TemplatesInGroup templates={templates || []} group={selected} onSelectRecipe={onSelectRecipe} />
      </main>
      {/* <footer>
        <IconInfo className={listClass.elem("info-icon")} width="20" height="20" />
        See the documentation to <a href="https://labelstud.io/guide" target="_blank">contribute a template</a>.
      </footer> */}
    </div>
  );
};