import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  /* useState - это хук React, позволяет использовать возможности React даже функциональным компонентам.
    Конкретно useState(initialState) позволяет добавлять состояния переменным, объектам, всему
    [] - это деструктуризация массива, {} - объекта
    useState возвращает массив, но через деструктуризацию в переменную user кладется переменная с обновляемым состоянием, 
    а в setUser - функция, которая имеет один аргумент и обновляет состояние переменной user.
  */
  const [user, setUser] = useState(null); // Данные пользователя
  const [userInfo, setUserInfo] = useState(null); // Данные с сайта
  const [loading, setLoading] = useState(false); // флаг загрузки
  const [error, setError] = useState(null); // флаг ошибки
  const [formData, setFormData] = useState({ name: '', age: '' }); // Данные формы

  // Функция для работы с cookies
  const setCookie = (name, value, days = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    // просто создали куки в правильном формате и сохранили
    // document.cookie - аксессор (специальный метод, который позволяет получать и изменять значение свойств объекта без прямого доступа к ним)
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      c = c.trim();
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Удаляем куки 
  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  // Асинхронное получение данных с сайта
  // const fetchUserData = () => {
  //   setLoading(true);
  //   setError(null);
  //   const fetchPromise = new Promise((resolve, reject) => {
  //     //fetch('https://randomuser.me/api/')
  //     fetch('https://randomuser.com/api/')
  //       .then(response => {
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //         return response.json();
  //       })
  //       .then(data => resolve(data))
  //       .catch(error => reject(error));
  //   });

  //   // Обрабатываем Promise
  //   fetchPromise
  //     .then(data => {
  //       const userData = data.results[0];
  //       setUserInfo({
  //         email: userData.email,
  //         phone: userData.phone,
  //         picture: userData.picture.large,
  //         location: `${userData.location.city}, ${userData.location.country}`
  //       });
  //       setLoading(false);
  //     })
  //     .catch(error => {
  //       console.error('Ошибка при получении данных:', error);
  //       setError('Не удалось получить данные с сервера. Проверьте подключение к интернету.');
  //       setLoading(false);
  //     });
  // };

  const fetchUserData = async () =>   {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch('https://randomuser.me/api/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const userData = data.results[0];
    
    // 4. Обновление состояния
    setUserInfo({
      email: userData.email,
      phone: userData.phone,
      picture: userData.picture.large,
      location: `${userData.location.city}, ${userData.location.country}`
    });
    
  } catch (error) {
    console.error('Ошибка:', error);
    setError('Не удалось получить данные. Проверьте подключение к интернету.');
  } finally {
    setLoading(false); 
  }
  };

  // useEffect для проверки cookie при загрузке компонента
  /*
    useEffect — это хук в React, который позволяет выполнять побочные эффекты в функциональных компонентах.
    Побочные эффекты — это любые действия, которые выходят за рамки возврата JSX:
     - запросы к API, подписки на события, работа с DOM, таймеры и т. д.
    Основные концепции:
     - Выполняется после рендера компонента (или после обновления DOM).
     - Может зависеть от зависимостей (второй аргумент — массив [], там лежат любые переменные, 
        которые вы хотите отслеживать и при изменении которых перерендеривать компонент).
     - Может возвращать функцию очистки (для отписки от событий или таймеров).
    При изменении depencies сначала выполняется функция очистки.
    useEffect выполняется после того, как компонент смонтирован (отрендерен в DOM) 
    и после каждого обновления (если не указаны зависимости).
    Точный порядок срабатывания:
     - Рендер компонента (возврат JSX).
     - Браузер отображает DOM.
     - Запускается useEffect.
  */

  useEffect(() => {
    const savedName = getCookie('userName');
    const savedAge = getCookie('userAge');
    
    if (savedName && savedAge) {
      setUser({ name: savedName, age: savedAge });
      fetchUserData();
    }
  }, []);

  // Кнопка регистрации
  const handleRegistration = () => {
    if (!formData.name.trim() || !formData.age.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    if (isNaN(formData.age) || formData.age < 1 || formData.age > 120) {
      alert('Пожалуйста, введите корректный возраст');
      return;
    }
    setCookie('userName', formData.name);
    setCookie('userAge', formData.age);
    setUser({ name: formData.name, age: formData.age });
    fetchUserData();
    setFormData({ name: '', age: '' });
  };

  // Отслеживание ввода в полях для взаимного обновления как переменных, связанных с полями, так и самих полей
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Кнопка выхода
  const handleLogout = () => {
    deleteCookie('userName');
    deleteCookie('userAge');
    setUser(null);
    setUserInfo(null);
    setError(null);
  };

  // Возвращаем jsx разметку
  return ( 
    <div className="app-container">
      <div className="content-container">
        <h1 className="lab-title">
          Лабораторная работа: Cookies и Promise
        </h1>
        
        {// Проверяем, вдруг уже есть куки
        !user ? (
          // Юзера нет, показываем форму регистрации
          <div className="form-container">
            <h2 className="form-title">
              Регистрация пользователя
            </h2>
            <div className="form-inputs-container">

              <div className="wide">
                <label htmlFor="name" className="input-label">
                  Имя:
                </label>
                <input
                  type="text"
                  id="name"
                  name = "name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="name-input-field"
                  placeholder="Введите ваше имя"
                />
              </div>

              <div className="wide">
                <label htmlFor="age" className="input-label">
                  Возраст:
                </label>
                <input
                  type="number"
                  id="age"
                  name = "age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="1"
                  max="120"
                  className="name-input-field"
                  placeholder="Введите ваш возраст"
                />
              </div>
              
              <button
                onClick={handleRegistration}
                className="register-button"
              >
                Зарегистрироваться
              </button>
            </div>
          </div>
        ) : (
          // Юзер есть, показываем инфу
          <div className="user-info-container">
            <div className="user-info-card">
              <div className="header-container">
                <h2 className="form-title">
                  Добро пожаловать, {user.name}! 
                </h2>
                <button
                  onClick={handleLogout}
                  className="logout-button">
                  Выйти
                </button>
              </div>
              
              <p className="user-age-text">
                Ваш возраст: {user.age} лет
              </p>
              
              {loading && (
                <div className="loading-container">
                  <span className="loading-text">Загружаем дополнительную информацию...</span>
                </div>
              )}
              
              {error && (
                <div className="error-notification">
                  <strong>Ошибка:</strong> {error}
                  <button
                    onClick={fetchUserData}
                    className="retry-button">
                    Попробовать снова
                  </button>
                </div>
              )}
              
              {userInfo && (
                <div className="user-details-section">
                  <h3 className="details-heading">
                    Дополнительная информация:
                  </h3>
                  
                  <div className="user-data-container">
                    <img
                      src={userInfo.picture}
                      alt="Аватарка"
                      className="user-avatar"
                    />
                    
                    <div className="user-text-data">
                      <p className="user-info-line">
                        <strong>Email:</strong> {userInfo.email}
                      </p>
                      <p className="user-info-line">
                        <strong>Телефон:</strong> {userInfo.phone}
                      </p>
                      <p className="user-info-line">
                        <strong>Локация:</strong> {userInfo.location}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;