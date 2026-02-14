import { useState } from "react"

export const Categories = () => {

  const[Active,setActive] = useState(0)

  return (
    <div className="categories">
      <ul>
        <li className="active">Все</li>
        <li>Мясные</li>
        <li>Вегетарианская</li>
        <li className={Active ===}">Гриль</li>
        <li>Острые</li>
        <li>Закрытые</li>
      </ul>
    </div>
  );
};
