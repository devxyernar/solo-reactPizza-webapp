import { useNavigate } from 'react-router';
import styles from './NotFound.module.scss';

export const NotFoundBlock = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.root}>
      <h1 className={styles.title}> К сожалению ничего не найдено 😕 </h1>
      <p className={styles.title_description}>
        На нашей странице отсутствует данная страница, пожалуйста перейдите в главное меню
      </p>
      <button onClick={() => navigate('/')} className={`button ${styles.homeButton}`}>
        Главное меню
      </button>
    </div>
  );
};
