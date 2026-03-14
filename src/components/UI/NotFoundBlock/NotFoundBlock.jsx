import styles from './_NotFound.module.scss';

export const NotFoundBlock = () => {
  return (
    <div className={styles}>
      <h1> К сожалению ничего не найдено 😕 </h1>
      <p className={styles.description}>
        На нашей странице отсутствует данная страница, пожалуйста перейдите в главное меню
      </p>
      <button className="button">Главное меню</button>
    </div>
  );
};
