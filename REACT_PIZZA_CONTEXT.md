# React Pizza — Full Codebase Audit & Engineering Mentor Handoff

Дата аудита: **15 октября 2026**, Europe/Madrid. Целевой срок MVP: **15–21 октября 2026 включительно**.

Репозиторий: `/Users/zhaksylykyernar/dev/pet-projects/react`. HEAD: `126ac5b`. Аудит относится к **working tree**, включая незакоммиченные изменения, а не только к HEAD. До аудита уже были изменены `package.json`, `package-lock.json`, `server/src/index.ts`, `server/src/types.ts`, `src/entities/cart/model/cartSlice.ts`.

Режим: **audit only**. Создан только этот документ. Application code, manifests, lockfiles и конфигурация не изменялись; пакеты не устанавливались. Содержимое `.env`, credentials и реальные клиентские данные в отчёт не включены. Ссылки `file:line` относятся к текущему исходному коду на дату аудита. Пути в тексте относительно указанного корня.

## A. Executive Summary

Сейчас это React SPA с реализованным каталогом и клиентской корзиной плюс начальный Express API заказов. **Функциональный full-stack MVP ещё не завершён**: UI не отправляет заказ, собственного каталога на сервере нет, PostgreSQL не подключён кодом, заказы живут только в памяти, authentication и payments отсутствуют.

Реализованные сильные стороны: Redux Toolkit, отдельные slices и selectors, различение вариантов товара в корзине, вычисляемые totals, сохранение корзины, обработка loading/error/empty, retry, отмена основного запроса каталога и первичная проверка URL-параметров. Это нужно сохранить и развивать постепенно.

Главный текущий риск — разрыв между **описанными типами и фактическим runtime**. `CreateOrderRequestSchema` существует, но route его не использует. `OrderSchema.items` — один объект, route сохраняет массив; request schema требует массив целых заказов. TypeScript проверка сервера падает именно на этом несоответствии. HTTP handler принимает невалидные customer fields и произвольные элементы заказа. `GET /api/orders` раскрывает все сохранённые заказы без проверки пользователя.

### Технологии и зависимости

Два отдельных npm-пакета с собственными lockfiles v3; npm workspaces отсутствуют. Диапазон из manifest и фактически установленная версия различаются штатным образом из-за `^`. `npm ls --depth=0` в обоих пакетах завершился успешно.

| Пакет | Диапазон в manifest | Установлено при аудите |
| --- | --- | --- |
| react / react-dom | `^19.2.0` | `19.2.4` / `19.2.4` |
| @reduxjs/toolkit | `^2.11.2` | `2.11.2` |
| react-redux | `^9.2.0` | `9.2.0` |
| react-router / react-router-dom | `^7.13.0` | `7.18.4` / `7.18.4` |
| axios | `^1.18.0` | `1.20.0` |
| lodash | `^4.18.1` | `4.18.1` |
| qs | `^6.15.3` | `6.16.0` |
| react-content-loader | `^7.1.2` | `7.1.2` |
| react-paginate | `^8.3.0` | `8.3.0` |
| vite | `^7.2.4` | `7.3.5` |
| @vitejs/plugin-react | `^5.1.1` | `5.1.4` |
| vitest | `^4.1.10` | `4.1.11` |
| eslint / @eslint/js | `^9.39.3` / `^9.39.1` | `9.39.3` / `9.39.3` |
| eslint-plugin-react-hooks | `^7.0.1` | `7.0.1` |
| eslint-plugin-react-refresh | `^0.4.24` | `0.4.26` |
| globals | `^16.5.0` | `16.5.0` |
| sass / scss | `^1.97.3` / `^0.2.4` | `1.97.3` / `0.2.4` |
| jsdom | `^29.1.1` | `29.1.1` |
| @testing-library/react | `^16.3.2` | `16.3.2` |
| @testing-library/user-event | `^14.6.4` | `14.6.4` |
| @testing-library/jest-dom | `^6.9.1` | `6.9.1` |
| @types/react / @types/react-dom | `^19.2.5` / `^19.2.3` | `19.2.14` / `19.2.3` |
| zod (root devDependency) | `^4.6.7` | `4.6.7` |
| express (server dependency) | `^5.2.1` | `5.2.1` |
| pg (server dependency) | `^8.23.0` | `8.23.0` |
| @types/express | `^5.0.6` | `5.0.6` |
| @types/node | `^26.5.0` | `26.5.0` |
| @types/pg | `^8.23.1` | `8.23.1` |
| tsx / nodemon | `^4.23.13` / `^3.1.14` | `4.23.13` / `3.1.14` |
| typescript (только server) | `^7.0.2` | `7.0.2` |

Основания: `package.json:6`, `package.json:14`, `package.json:27`, `server/package.json:5`, `server/package.json:14`, `server/package.json:18`; оба lockfiles. Node в проверяемом окружении — `v20.20.0`, npm — `10.8.2`. Это факт окружения, а не зафиксированная поддерживаемая версия проекта: `engines` и файл выбора Node отсутствуют. Не выполнялся network dependency/security audit; установленная версия не означает отсутствие уязвимостей.

Готовность: frontend — частично законченная функциональность; backend — прототип; persistence, identity и mock payments — отсутствуют; автоматические quality gates сейчас красные. Срок семь дней возможен только при узком scope, ежедневной интеграции и выделенном времени. Назвать проект production-ready по текущим данным нельзя.

## B. Repository Structure

Прочитаны все application source files, стили, конфигурация и manifests; lockfiles проверены на структуру и версии прямых зависимостей. Binary assets инвентаризированы, не анализировались как код. `node_modules`, `.git` internals, build artifacts, caches и локальные editor/OS-файлы исключены из функционального анализа. Применимых `AGENTS.md` в дереве репозитория и родительской цепочке не обнаружено.

```text
react/
├── package.json / package-lock.json       # frontend scripts и зависимости; Zod пока здесь
├── vite.config.js                        # React plugin, alias @, конфигурация Vitest
├── eslint.config.js                      # lint только JS/JSX
├── jsconfig.json                         # editor alias; не полноценный TS quality gate
├── index.html                            # SPA entry, пока title react / Vite favicon
├── .gitignore                            # node_modules, dist, .env и локальные файлы
├── public/
│   ├── img/{cheese,chicken-bbq,margarita,pepperoni-fresh}.jpg
│   ├── react-pizza-logo.svg
│   └── vite.svg
├── src/
│   ├── main.jsx                          # createRoot, StrictMode, providers, global styles
│   ├── vite-env.d.ts                      # объявление VITE_API_URL
│   ├── app/
│   │   ├── App.jsx                       # Header + router; неиспользуемый SearchContext
│   │   ├── providers/{AppProviders.jsx,SearchContext.js}
│   │   ├── router/AppRouter.jsx          # /, /cart, *
│   │   ├── store/{store.js,rootReducer.js}
│   │   └── styles/                       # globals, reset, variables, fonts, mixins
│   ├── entities/
│   │   ├── cart/model/cartSlice.ts       # cart reducers, localStorage restore, selectors
│   │   ├── cart/model/сartSlice.test.ts  # пустой файл; первая «с» кириллическая
│   │   └── pizza/
│   │       ├── model/pizzaSlice.ts       # axios + createAsyncThunk
│   │       └── ui/                       # PizzaCard, PizzaSkeleton, стили
│   ├── features/
│   │   ├── filter-pizzas/                # filterSlice, Categories, Sort
│   │   └── search-pizza/ui/              # SearchBar и CSS Module
│   ├── pages/                            # Home, Cart, EmptyCart, NotFound
│   ├── widgets/Header/                   # logo, search, totals, clear cart
│   ├── shared/ui/                        # Pagination, NotFoundBlock, Button.scss
│   ├── test/setup.ts                     # cleanup после теста
│   └── assets/fonts/                     # 7 локальных woff2, 5 начертаний подключены
└── server/
    ├── package.json / package-lock.json   # Express + pg; dev запуск через tsx
    ├── tsconfig.json                     # strict, NodeNext, types: []
    └── src/
        ├── index.ts                      # весь Express app, routes и массив orders
        └── types.ts                      # CustomerSchema, OrderSchema, CreateOrderRequestSchema
```

Не найдены README, `.env.example` для обоих пакетов, Dockerfile/Compose, SQL/migrations/seeds, ORM config, CI workflows, deployment config, API specification. Root `tsconfig.json` отсутствует. `.openai/hosting.json` отсутствует. В репозитории нет подтверждения существующего deployment; внешнее состояние hosting и локального PostgreSQL не исследовалось.

## C. Implemented Functionality

Обозначения: **подтверждено probe** — выполнена ограниченная изолированная проверка; **реализовано по коду** — есть реализация, но браузерный/HTTP E2E не выполнялся; **частично** — сценарий имеет существенный пробел; **отсутствует** — реализации в исследуемом дереве нет.

| Функция | Состояние | Основание / ограничение |
| --- | --- | --- |
| SPA routing и NotFound | Реализовано по коду | `src/app/router/AppRouter.jsx:6`; только `/`, `/cart`, `*` |
| Загрузка каталога | Частично | `pizzaSlice.ts:30`; требует VITE_API_URL и совместимого внешнего ответа; собственного catalog route нет |
| Категории и сортировка | Реализовано по коду, с ограничениями | `Home.jsx:96`; query передаётся API; результат зависит от внешнего API |
| Поиск с debounce | Частично | `SearchBar.jsx:23`; старый debounce не отменяется при очистке |
| Пагинация | Частично | `Home.jsx:178`; всегда 3 страницы независимо от результата |
| URL filters | Частично | `Home.jsx:55`, `Home.jsx:71`; первичная нормализация есть, back/forward и search не синхронизированы полностью |
| Loading / empty / error / retry | Реализовано по коду | `Home.jsx:119`; race protection и runtime schema ответа отсутствуют |
| Выбор dough / size / price | Частично | `PizzaCard.jsx:16`; цена по индексу размера, тип `prices` неверен |
| Корзина разных вариантов | Подтверждено probe | key сравнения — id + type + size, `cartSlice.ts:54` |
| Plus / minus / remove / clear | Реализовано; minus/remove проверены probe | `cartSlice.ts:66`, `:77`, `:100`, `:111`; отсутствие ограничений количества |
| Totals | Подтверждено probe для валидных данных | `cartSlice.ts:120`, `:126`; невалидные prices/count ломают расчёт |
| Сохранение корзины | Частично | restore ловит ошибки JSON, но не проверяет структуру; запись без try/catch |
| Customer form / отправка заказа / подтверждение | Отсутствует | `Cart.jsx:244` — декоративная кнопка |
| Echo checkout | Подтверждено probe обработчика | `server/src/index.ts:19`; отражает body, не оформляет заказ |
| Создание заказа через API | Частично, небезопасно | `server/src/index.ts:23`; только поверхностные проверки, in-memory storage |
| Чтение заказов | Частично, небезопасно | `server/src/index.ts:60`; общий массив всем вызывающим |
| Zod validation запросов | Схемы есть, в routes не используется | `server/src/types.ts:3`, `:11`, `:24`; type-only import в index |
| PostgreSQL | Драйвер установлен, интеграция отсутствует | `server/package.json:16`; нет Pool/Client/queries |
| Authentication / authorization / history UI | Отсутствует | Нет user model, auth middleware, owner filtering или UI |
| Real / mock payments | Отсутствует | Echo route не является payment mock |
| Автотесты | Инструменты есть, тестов нет | пустой `сartSlice.test.ts`, Vitest fails |

### Фактический user journey

1. `src/main.jsx:7` монтирует StrictMode → BrowserRouter/Redux Provider → App → Header + Home.
2. Store при импорте читает `localStorage.items` (`cartSlice.ts:36`). Header сразу считает totals. Некорректная структура сохранённого состояния способна остановить UI ещё до полезного каталога.
3. Home один раз читает query (`Home.jsx:71`), нормализует page/category/sort, затем запускает thunk.
4. Thunk выполняет GET на адрес из `VITE_API_URL` (`pizzaSlice.ts:36`). Точное значение и доступность адреса не проверялись; секреты не раскрывались. Express из `server/` не умеет отдавать этот каталог.
5. Пользователь меняет фильтры или вводит поиск. Redux обновляется, основной effect отменяет предыдущий request и запускает следующий. Текущее число страниц не вычисляется из API.
6. PizzaCard выбирает dough code из `types`, size index из `sizes`; price берётся из `prices[sizeIndex]`. В корзину кладутся отображаемые dough name и size, id, title, imageUrl и client price (`PizzaCard.jsx:21`).
7. Повторное добавление того же id/type/size увеличивает count. Другой вариант создаёт отдельную строку. Header и Cart читают общие selectors, store subscription сохраняет cart после каждого Redux update.
8. `/cart` показывает позиции, quantity, totals; доступны +/- и удаления с подтверждением для remove/clear на странице. Очистка из Header подтверждения не запрашивает (`Header.jsx:60`).
9. На «Оплатить сейчас» путь **заканчивается**. Нет формы, HTTP POST, order result, mock payment, очистки корзины после успеха или истории.

Отдельно API можно вызвать вручную, но это не интеграция frontend checkout.

## D. Frontend Architecture

### Организация, state и routing

Структура напоминает FSD: app/pages/widgets/features/entities/shared. Это небольшая SPA, а не строго изолированная архитектура: например, `PizzaCard.scss:1` импортирует mixin из app, поэтому не стоит объявлять полное соблюдение FSD. Полная перестройка слоёв для MVP не нужна.

`src/app/store/rootReducer.js:5` объединяет `filter`, `cart`, `pizzas`; `store.js:4` использует configureStore. React Redux hooks нетипизированы. В `cartSlice.ts:32` вручную задан узкий RootState только с cart вместо вывода типа из настоящего store.

`filterSlice.js:3` хранит categoryId, sort object, currentPage, searchValue и неиспользуемый pageCount. Категории заданы массивом в `Categories.jsx:5`; sort options — в `Sort.jsx:4`. Поиск реально работает через Redux. `SearchContext` из `App.jsx:7`/`:10` не имеет потребителей в приложении и дублирует идею поискового состояния без функциональной пользы.

`AppRouter.jsx:8`/`:9` содержит только каталог и корзину. EmptyCart — conditional render внутри Cart, а не отдельный route. Header и SearchBar остаются на всех страницах. BrowserRouter потребует SPA fallback на hosting при прямом открытии `/cart` и будущих вложенных routes.

### HTTP и каталог

Единственный application HTTP client call — `axios.get<Pizzas[]>` в `src/entities/pizza/model/pizzaSlice.ts:36`. Общего axios instance, timeout policy, auth credentials/interceptors и order client нет. `src/vite-env.d.ts:2` объявляет имя `VITE_API_URL`, но объявление не гарантирует наличие значения при запуске.

Query: `page`, `limit=4`, необязательные `category`, `search`, `sortBy`, `order`. Сортировка по `price` использует API поле `price`, тогда как карточка показывает `prices[activeSize]`: значения должны иметь согласованную семантику базовой/minimal price. Сейчас она не закреплена контрактом.

Thunk ожидает **голый массив**, сохраняет response.data без runtime validation (`pizzaSlice.ts:40`, `:62`). Generic Axios не проверяет JSON. Ответ `{ items, total }`, HTML или массив неполных объектов несовместимы с текущим render. Если направить VITE_API_URL на текущий `/api/orders`, это будут объекты заказов вместо пицц; на `/` — текст, а products endpoint отсутствует.

Основной effect использует thunk abort signal (`Home.jsx:109`, `pizzaSlice.ts:38`). Однако reducers не сравнивают requestId; aborted rejected не отделён от сетевой ошибки (`pizzaSlice.ts:65`). Retry (`Home.jsx:115`) создаёт запрос вне cleanup основного effect. Это оставляет риск stale result/error при пересекающихся запросах; браузерная гонка в этом аудите не воспроизводилась.

Поиск вставляется в URL напрямую (`Home.jsx:100`), поэтому `&`, `#`, `+` меняют смысл запроса. Нужны структурированные query params/encoding. URL сериализует только sort/category/page (`Home.jsx:60`); search не восстанавливается. Начальное чтение query зависит только от dispatch, поэтому browser back/forward не приводит к гарантированному восстановлению Redux filters.

### Product variants и корзина

Текущая identity: product id + **строковое имя теста** + size. Отдельного variantId нет. `PizzaCard.jsx:16` корректно берёт первый доступный dough code, а не предполагает обязательный 0; это уже реализовано. Два dough значения отображаются через hardcoded `typesNames` (`:18`). Код предполагает совместимые, непустые `types/sizes/prices`, но их не валидирует. Цена зависит только от size index; dough-specific pricing не реализован, и необходимость такой цены должна быть решена как business rule.

`cartSlice.ts:52` требует CartItems с обязательным count, но карточка передаёт объект без count и reducer сам ставит 1. `CartItems.size` — string (`:8`), а `sizes` в Pizzas — number[] и карточка передаёт число. Это разрыв TS и JS boundary; он не мешает одинаковым runtime значениям сравниваться, но типам и будущему API доверять нельзя. Runtime тип product id из внешнего API не проверяется; number в interface не доказывает number в JSON.

Расчёт: `sum(price * count)` и `sum(count)`; результат не хранится второй копией, что хорошо. Probe подтвердил: две одинаковые пиццы по 500 плюс другой размер по 700 дают 3 единицы и 1700; decrement последней единицы удаляет вариант; remove удаляет нужную позицию. Это проверка reducer/selectors с синтетическими данными, не UI E2E.

`localStorage` содержит `{items:[...]}` под ключом `items`; не просто массив. Restore ловит invalid JSON, но cast `as CartState` не валидирует parsed object. `{}` и `{items:null}` вызывают TypeError в totals. Subscription пишет после **любого** store update и без обработки quota/access errors (`store.js:7`). Данные локального хранилища и client price должны считаться недоверенными при checkout.

### TypeScript, UI и стили

Frontend — смесь JSX/JS и двух TS slices, а не полностью типизированный React app. Root compiler/typecheck script нет; ESLint pattern охватывает только JS/JSX (`eslint.config.js:10`). `Pizzas.prices: number` (`pizzaSlice.ts:11`) противоречит индексированию в карточке. `catch(error:any)` скрывает различия типов ошибок (`:41`).

SCSS global styles + CSS Modules, CSS custom properties и локальные шрифты. Media queries есть в globals/Header/SearchBar, но visual/mobile QA не выполнялось. `reset.scss:5` отключает outline для всех элементов без общего focus-visible восстановления. Кликабельные div/li/svg вместо buttons мешают keyboard operation. В globals используются необъявленные CSS variables (например `--gray`, `--gray-light`, `--gray-text`), в отличие от имеющихся `--gray-b6`/`--gray-8d` (`variables.scss:13`). `NotFoundBlock.jsx:9` использует `title_description`, CSS Module объявляет `titleDescription` (`NotFound.module.scss:15`).

## E. Backend Architecture

### Фактическое устройство

Весь app, listener, handlers и storage находятся в `server/src/index.ts:1`. Есть `express.json()` (`:7`), массив `orders: Order[]` (`:9`) и пять endpoints. Router/controller/service/repository modules, конфигурация окружения, DB layer и auth отсутствуют. Для двух маленьких файлов это понятная стартовая точка; разносить по десяткам abstractions сейчас не требуется.

`PORT=3000` hardcoded (`:5`); нет чтения PORT из environment, graceful shutdown или DB pool cleanup. `listen` находится в том же модуле, что app (`:64`), поэтому прямой import неудобен для интеграционных тестов. `tsx watch src/index.ts` — development command и не выполняет tsc typecheck. `nodemon` установлен, но script им не пользуется.

### Все существующие HTTP endpoints

| Method / path | Request | Response по коду | Storage / ограничения |
| --- | --- | --- | --- |
| `GET /` | Без body | 200 text `Server Created on port 3000!` | Только диагностический текст, `index.ts:11` |
| `GET /health` | Без body | 200 JSON `{ "status": "ok" }` | Liveness, не DB readiness, `:15` |
| `POST /api/checkout/test` | Body, прочитанное express.json | 200 JSON отражение `req.body` | Нет validation/order/payment logic, `:19` |
| `POST /api/orders` | Truthy customer fields + непустой items array | 201 `{success:true,message,order}`; 400 для трёх поверхностных проверок | Массив памяти; схема не вызывается, `:23` |
| `GET /api/orders` | Без auth или параметров | 200 JSON `orders` — bare array | Все заказы текущего процесса, без pagination/owner filtering, `:60` |

Не существуют `/api/products`, order detail route, auth endpoints, payment endpoints, order history UI/API с разграничением доступа. Нет hidden implementation в других backend files: их только два.

### Validation и создание заказа

`index.ts:2` содержит **только type import** `Order, CreateOrderRequest`; CreateOrderRequest не используется. Ни одной ссылки `.parse`/`.safeParse` в routes нет. Zod schema не запускается от присвоения типа и исчезновения type imports при transpilation.

Алгоритм POST: проверить наличие keys body → destructure customer/items → truthiness name/phone/address → Array.isArray и length → создать id из Date.now + random 0–999 → скопировать customer fields и items → orders.push → 201 (`index.ts:24`–`:57`).

Он не проверяет типы/длины/пробелы customer, тип каждого item, существование товара, size/dough combination, положительное quantity, верхние limits, price и total. Пустые строки блокируются truthiness, строки из пробелов и truthy числа/объекты проходят. `items:[null]` проходит. Это подтверждено direct-handler probes. ID не имеет гарантии уникальности, отсутствуют timestamps, currency, totals, owner и payment/order status.

На текущем сервере **вообще нет расчёта цены**; он не вычисляет итог из client price и не проверяет его. Он просто сохраняет произвольный items JSON, включая переданную цену. Нельзя описывать это как реализованный небезопасный payment processor: payment processor отсутствует.

### Ошибки и security

400 replies используют разные форматы (`{error}` против `{success:false,message}`). Custom error middleware и JSON 404 нет. Express имеет встроенные ошибки, в том числе parsing malformed JSON; отсутствие custom handler не означает отсутствие обработки вообще. Но контракт ошибок приложения, безопасное production formatting и логирование не настроены и HTTP-level здесь не проверялись.

`express.json()` уже имеет library defaults для body parsing/limits; неверно утверждать, что вообще нет ограничения HTTP body. При этом нет business limits на items/customer strings, rate limiting и срока/объёма хранения массива.

Основной security defect — **публичное чтение заказов с customer PII**. Нет authentication, authorization и owner check. Неиспользуемая схема не защищает от invalid input. CORS/proxy не настроены: Vite и Express на разных origins не образуют готовую browser integration. CORS сам по себе не является authorization. Нет security-header middleware, session/cookie policy и auth rate limit; это задачи до публичного запуска, а не признак уже существующей auth системы.

### TypeScript и packaging

`server/tsconfig.json:10` — NodeNext, target esnext, strict true, noUncheckedIndexedAccess, exactOptionalPropertyTypes, verbatimModuleSyntax; `types: []` отключает автоматическое включение global @types. `rootDir/outDir` закомментированы, include/exclude не заданы, dedicated build/typecheck scripts отсутствуют. Существующий tsc noEmit работает, но обнаруживает ошибку items. `@types/node` major 26 не совпадает с runtime Node 20: сам по себе этот факт не доказывает текущий runtime bug, но будущие API нужно проверять на выбранной Node версии.

`server/package.json:6` запускает `node index.ts`, а реальный entry — `src/index.ts`. Проверка start завершилась MODULE_NOT_FOUND. После исправления пути отдельно требуется выбрать TS build/runtime strategy; простая смена пути на .ts не гарантирует работоспособность под Node 20.

Zod импортирован в `server/src/types.ts:1`, но объявлен только root devDependency (`package.json:44`), отсутствует в `server/package.json`. В текущем дереве schema module разрешает Zod из parent node_modules. **Текущий index использует type-only import**, поэтому не загружает schema module в runtime; нельзя заявлять, что текущий server обязательно падает из-за Zod. Когда route начнёт вызывать схемы, isolated production install server должен включать Zod как runtime dependency.

## F. API Contracts

### F1. Каталог — ожидания клиента, а не подтверждённый внешний контракт

`GET <VITE_API_URL>?page=N&limit=4[&category=N]&sortBy=rating|price|title&order=asc|desc[&search=...]`.

По использованию компонентами ответ должен быть массивом объектов примерно такой формы (синтетический пример):

```json
[
  {
    "id": 1,
    "title": "Example pizza",
    "imageUrl": "/img/cheese.jpg",
    "types": [0, 1],
    "sizes": [26, 30, 40],
    "price": 500,
    "prices": [500, 650, 800],
    "category": 1,
    "rating": 4
  }
]
```

Массив prices выведен из `PizzaCard.jsx:20`; interface сейчас ошибочно объявляет number. Live response не запрашивался, поэтому точные id types, наличие prices и semantics category/rating у внешнего сервиса не подтверждены. Total/pageCount API клиент не читает.

### F2. CartItems → CreateOrderRequestSchema → OrderSchema → routes

| Поле/смысл | Frontend CartItems (`cartSlice.ts:3`) | Schema backend (`types.ts:11`, `:24`) | Фактический POST (`index.ts:27`) |
| --- | --- | --- | --- |
| Product ID | `id: number` в type | `pizzaId: string` внутри вложенного items object | Никакой проверки |
| Dough | `type: string` — отображаемое имя | `type: number` | Никакой проверки |
| Size | `size: string` в type, number из карточки | Поля нет | Принимает произвольное |
| Count | `count: number` | `quantity: positive integer` | Никакой проверки |
| Price | `price: number` | Поля нет | Сохраняет если передано, не рассчитывает |
| Title / image | Оба есть | title есть, image отсутствует | Принимает произвольное |
| Order items | CartState содержит массив CartItems | OrderSchema содержит **один object**; CreateOrderRequestSchema содержит **array(OrderSchema)** | Требует **непустой array**, элементы любые |
| Customer | В корзине и форме отсутствует | CustomerSchema name/phone/address | Только truthiness полей |
| Order ID | Клиент при создании не должен задавать | Каждый элемент request.items должен иметь order id | Генерируется сервером только для внешнего заказа |

Имеющаяся схема запроса буквально выражает:

```ts
// server/src/types.ts:24 — текущее состояние, не рекомендуемый контракт
items: z.array(OrderSchema).min(1, 'Добавьте хотя бы одну пиццу!')
```

Следствие: ожидается `{customer, items:[{id, customer, items:{pizzaId,title,type,quantity}}]}`. Это не recursive schema, но ошибочная вложенность «заказ содержит список заказов». Probe: нормальная cart item не проходит; вложенный order проходит; dough code 999 не запрещён. OrderSchema не описывает фактически созданный route order с массивом items. `orders.push(newOrder)` приводит к TS2345 (`index.ts:52`).

CustomerSchema (`types.ts:3`) проверяет только min lengths 1/1/3, не делает trim/max/phone policy. Probe со строками из пробелов проходит. Даже после подключения этой схемы бизнес-валидация не станет полной автоматически.

### F3. Фактический POST /api/orders

В текущем handler проходит такой синтетический request; это описание поведения, не рекомендуемый контракт:

```json
{
  "customer": {"name": "Example", "phone": "test", "address": "Test address"},
  "items": [{"id": 1, "type": "тонкое", "size": 30, "count": 2, "price": 500}]
}
```

Response 201:

```json
{
  "success": true,
  "message": "Order created successfully!",
  "order": {
    "id": "<server-generated-id>",
    "customer": {"name": "Example", "phone": "test", "address": "Test address"},
    "items": [{"id": 1, "type": "тонкое", "size": 30, "count": 2, "price": 500}]
  }
}
```

Response 400 по branches: пустой body → `{error:"Request Body is required"}` (`index.ts:25`); отсутствуют truthy customer fields → `{success:false,message:"Заполните все данные клиента!"}` (`:30`); items не array или пустой → `{success:false,message:"Корзина не может быть пустой!"}` (`:37`). Эти branches не покрывают все invalid bodies. GET возвращает **только массив orders**, без success/data wrapper.

### F4. Целевой MVP-контракт — предложение, ещё не реализовано

Для срока семь дней выбрать один representation и зафиксировать его до SQL/UI интеграции. Предпочтительно `variantId` как серверная identity комбинации product/dough/size; request item содержит variantId + quantity. Cart можно мигрировать постепенно, сохранив нужные UI snapshot fields.

```json
{
  "customer": {"name": "Example", "phone": "test", "address": "Test address"},
  "items": [{"variantId": "<variant-id>", "quantity": 2}]
}
```

Request не задаёт trusted userId, total, price, payment status или order status. User берётся из session, варианты/цены — из БД, итог рассчитывается сервером. Противоречащие контракту поля нужно явно reject либо игнорировать по закреплённой policy; клиентская цена ни при каких условиях не определяет сумму.

Ответ заказа должен включать id, timestamps, items с snapshot title/dough/size/unitPrice/quantity, total, currency, orderStatus и paymentStatus. Форматы id, валюты и денежных единиц фиксируются совместно с БД. Для MVP: целые minor units, одна валюта, без float arithmetic. DTO запроса и DTO заказа должны быть разными схемами.

Предложение по API: public `GET /api/products` с `{items,total,page,limit}`, private `POST /api/orders`, `GET /api/orders` только текущего пользователя, `GET /api/orders/:id` с owner check, auth login/logout/me и mock-payment endpoint. Для каталога потребуется согласованное изменение thunk под envelope; нельзя поменять backend response без frontend adapter. 400 — invalid request, 401 — нет session, 404 — отсутствующий/чужой order по выбранной policy, 409 — недопустимый state transition, 500 — безопасная общая ошибка. Это целевой контракт, не перечень существующих routes.

## G. Database & Persistence

### Текущее состояние

**PostgreSQL не подключён приложением.** `pg` и его types установлены (`server/package.json:16`, `:21`), но нет import pg, Pool/Client, connection configuration, SQL queries, migrations или seed. Существование запущенного DB service где-либо на машине не проверялось и не заменяет integration.

`orders` — массив process memory (`index.ts:9`): теряется после рестарта/tsx reload; разные процессы имеют разные заказы; транзакций, indexes, relations и persistence нет. Browser localStorage хранит только корзину и не является серверной БД. Customer — объект внутри заказа, а не user account.

В исходниках используется только имя environment variable `VITE_API_URL`. Сервер environment variables сейчас не читает. Будущие имена, которые можно документировать без значений: `DATABASE_URL`, `PORT`, `NODE_ENV`, `SESSION_SECRET` и, если нужен отдельный origin, `CLIENT_ORIGIN`. Это **предлагаемые**, не обнаруженные настройки. Любая переменная `VITE_*` считается публичной для браузера; DB/session secrets туда не помещать.

### Минимальная relational model — рекомендация

| Таблица | Минимальная ответственность и constraints |
| --- | --- |
| products | id, title, image_url, category, rating, active; каталог товаров |
| product_variants | id, product_id FK, dough code, size, price_minor, active; UNIQUE(product_id,dough,size), CHECK для размера/цены |
| users | id, normalized email UNIQUE, password_hash, created_at; plaintext passwords не хранить |
| sessions | непрозрачный session identifier/его безопасное представление, user_id FK, expires_at; persistent session для нескольких запросов/рестартов |
| orders | id, user_id FK, customer snapshot, total_minor, currency, order_status, payment_status, created_at |
| order_items | id, order_id FK, variant_id FK, product/variant snapshots, unit_price_minor, quantity; CHECK(quantity>0) и business max |

Для mock payment отдельная payments table необязательна: на первом этапе достаточно payment_status и безопасного перехода состояния заказа. Для истории достаточно orders.user_id + created_at index и order_items.order_id index; показывать только свои записи. User email не должен подменяться customer.phone, а customer address не обязан быть постоянным user profile.

Создание заказа: проверить DTO → прочитать активные variants → убедиться, что все найдены → вычислить line totals/total → одной DB transaction вставить order и items → commit → ответ. При ошибке rollback, без частичных строк. Для pg использовать один checked-out client в transaction и обязательно release. Parameterized SQL для значений; sortBy/order из allowlist, SQL identifiers не строить из непроверенного input.

Snapshots сохраняют историю при изменении имени/цены товара. Order ID должен иметь DB uniqueness, например через UUID primary key. Повторная отправка не должна незаметно создавать новые заказы: минимум disable submit, предпочтительно ограниченный idempotency key с unique constraint, если укладывается в schedule. Idempotency mock payment обязательна для повторного вызова state transition.

### Архитектура по масштабу

**Modular monolith:** один Express app, одна PostgreSQL БД, React SPA. Сохранить существующие frontend slices/компоненты. Backend постепенно выделить по modules: catalog, orders, auth; HTTP validation/controller → service с business rules → repository с pg queries. Общие app setup/config/db/error handling отдельно по реальной необходимости. Разделить app и listen для тестов. Не вводить generic repository framework, CQRS или DI container без потребности.

Уже имеющегося pg достаточно для SQL learning; ORM не является prerequisite. Для короткого MVP нужны воспроизводимые SQL migrations и seed, а не новая инфраструктура. Microservices, Kafka, Kubernetes, Redis, очереди и event bus не требуются текущими сценариями. Frontend и backend можно размещать за одним origin/reverse proxy: это упрощает cookies и CORS. При разных origins нужна явная согласованная credential/CORS/CSRF policy.

## H. Bugs & Technical Debt

Severity: **Blocker** — препятствует целевому MVP или воспроизводимому запуску; **High** — нарушение целостности/security или падение основного сценария; **Medium** — функциональная/quality проблема с ограниченным impact; **Low** — polish и небольшой технический долг. Severity относится к планируемому MVP, а не к неизвестному production incident.

### Blocker

| ID | Finding и evidence | Последствие / следующий шаг |
| --- | --- | --- |
| B1 | `server/src/types.ts:14`, `:26`; `server/src/index.ts:52` | Order.items object vs route array; request items array of orders. TS2345 подтверждён. Разделить request item/request/order schemas и согласовать runtime route |
| B2 | `src/pages/Cart/Cart.jsx:244`; `src/app/router/AppRouter.jsx:8` | Checkout action/form/API call/result отсутствуют. Нельзя оформить заказ из приложения |
| B3 | `server/src/index.ts:9`, `:52`; `server/package.json:16` | Только in-memory orders, pg не используется. Нельзя обещать persistent MVP; нужны DB integration/migrations/catalog |
| B4 | `server/package.json:6`; реальный entry `server/src/index.ts:1` | `npm --prefix server start` → MODULE_NOT_FOUND. Выбрать корректный build/start и Node runtime |

### High

| ID | Finding и evidence | Риск / проверка |
| --- | --- | --- |
| H1 | `server/src/index.ts:60` | Всем выдаются все customer orders без auth/owner filtering. Direct handler вернул созданные probe записи без identity. Закрыть до публичного размещения |
| H2 | `server/src/index.ts:27`, `:29`, `:36`, `:49`; `server/src/types.ts:24` | Zod вообще не используется. Probe: customer с name:number/phone:boolean/address:object, items:[null], negative quantity и unknown pizza проходят с 201 |
| H3 | `server/src/index.ts:49`; нет catalog/price service в `server/src/index.ts:1` | Client JSON сохраняется без проверки вариантов и server-side pricing. Денежной бизнес-логики нет; до checkout получить цены из БД |
| H4 | `src/entities/cart/model/cartSlice.ts:42`, `:120`; `src/app/store/store.js:9` | `{}`/`{items:null}` из localStorage вызывают TypeError в selector (probe). Ошибки setItem не перехвачены; нужен schema-validated restore и безопасная запись |
| H5 | `src/entities/pizza/model/pizzaSlice.ts:11`, `:40`, `:62`; `src/entities/pizza/ui/PizzaCard.jsx:20`; `src/pages/Home/Home.jsx:123` | JSON каталога не валидируется, prices типизирован number. Неверный ответ ломает map/card или даёт undefined price/NaN total. Live API compatibility не доказана |
| H6 | `server/src/types.ts:1`; `package.json:44`; `server/package.json:14` | Zod не declared runtime dependency сервера. После включения validation isolated production server install может не разрешить импорт. Сейчас type-only index import не загружает Zod |

### Medium

| ID | Finding и evidence | Последствие / приоритет |
| --- | --- | --- |
| M1 | `src/pages/Home/Home.jsx:178`; `src/features/filter-pizzas/model/filterSlice.js:18`, `:27` | Hardcoded 3 pages, no reset on category/search; можно получить ложную пустую выдачу. Нужны API total и page reset/clamp |
| M2 | `src/features/search-pizza/ui/SearchBar.jsx:23`, `:28` | Pending debounce не cancel при clear/unmount; старый поиск возвращается после очистки. Вывод из кода, UI repro не выполнялся |
| M3 | `src/pages/Home/Home.jsx:100`; `src/entities/pizza/model/pizzaSlice.ts:37` | Search без encoding: спецсимволы меняют query. Использовать HTTP params/URLSearchParams |
| M4 | `src/pages/Home/Home.jsx:55`, `:71` | URL read только при mount; search не сериализуется. Back/forward и shared links не восстанавливают весь filter state |
| M5 | `src/pages/Home/Home.jsx:115`; `src/entities/pizza/model/pizzaSlice.ts:55`, `:65` | Retry вне abort cleanup, no requestId/abort discrimination. Возможны stale response/error; risk по коду, не заявленный E2E repro |
| M6 | `src/entities/cart/model/cartSlice.ts:8`, `:52`; `src/entities/pizza/ui/PizzaCard.jsx:22` | size number vs string; add payload требует count, который reducer создаёт сам. JS/TS boundary и нет типизированных Redux hooks |
| M7 | `server/src/types.ts:3` | Даже сама CustomerSchema пропускает whitespace-only поля; min не заменяет trim/max/phone policy. Probe прошёл |
| M8 | `server/src/index.ts:25`, `:30`, `:37`; `:7` | Разные error envelopes, нет custom JSON error/404 handling. Malformed JSON/oversized body не включены в HTTP tests |
| M9 | `server/src/index.ts:43`, `:49` | No guaranteed unique ID, timestamps/status/owner; нет quantity/item count upper bounds и deduplication policy |
| M10 | `vite.config.js:10`, `:15`; `eslint.config.js:10`; `src/entities/cart/model/сartSlice.test.ts` (0 строк) | Test environment typo; __dirname ломает runner loader; тестов нет, lint failing, TS files не lintятся. Не путать конфигурацию с quality coverage |
| M11 | `server/src/index.ts:5`, `:7`, `:64`; `vite.config.js:6`; `package.json:6` | Нет env/server integration/proxy/start orchestration, auth и security configuration. Разные browser origins потребуют CORS либо proxy; CORS не заменяет права |
| M12 | `src/entities/pizza/ui/PizzaCard.jsx:40`, `:63`; `src/pages/Cart/Cart.jsx:82`, `:135`; `src/app/styles/reset.scss:5` | Не-native controls, no keyboard handlers, отключён focus outline. Checkout и cart должны быть доступны с клавиатуры |
| M13 | `server/src/index.ts:64`; `server/tsconfig.json:12`; `server/package.json:20` | App связан с listener; нет тестового bootstrap/build pipeline; Node types major отличается от runtime. Зафиксировать runtime, не переписывая весь backend |

### Low

| ID | Finding и evidence | Следствие |
| --- | --- | --- |
| L1 | `src/app/App.jsx:7`, `:10`; `src/app/providers/SearchContext.js:3`; `src/features/filter-pizzas/model/filterSlice.js:5` | Unused parallel SearchContext и pageCount; небольшая cleanup задача |
| L2 | `src/widgets/Header/Header.jsx:60` vs `src/pages/Cart/Cart.jsx:37` | Два clear controls с разным подтверждением; унифицировать UX при polish |
| L3 | `src/shared/ui/NotFoundBlock/NotFoundBlock.jsx:9`; `NotFound.module.scss:15`; `src/app/styles/globals.scss:143`, `:171`; `variables.scss:13` | CSS Module naming mismatch и undefined variables. Визуальные последствия требуют browser QA |
| L4 | `index.html:2`, `:5`, `:7`; `src/features/filter-pizzas/ui/Sort.jsx:5`; `src/entities/pizza/ui/PizzaCard.jsx:35` | lang=en при русском UI, Vite branding, ASC/DESC в UI, generic image alt |
| L5 | `src/pages/Home/Home.jsx:122`; `src/entities/pizza/model/pizzaSlice.ts:37` | 6 skeletons при page limit 4; ненужный layout shift |
| L6 | `package.json:41`; `server/package.json:22`; `src/app/styles/fonts.scss:1` | scss package при использовании sass, неиспользуемый nodemon; часть font assets не подключена. Подтвердить отсутствие нужды перед удалением; в аудите ничего не удалялось |
| L7 | `.gitignore:25`; root inventory | Игнорируется `.env`, но не все возможные `.env.*`; шаблон без секретов и README отсутствуют. Факт текущей утечки credentials этим не установлен |

### Выполненные проверки и ограничения доказательств

Проверки проведены **15 октября**, предыдущие сентябрьские результаты из переписки не считаются текущим evidence. Использовались установленные локальные binaries, без npx/download/install и без изменений конфигурации.

| Проверка | Результат |
| --- | --- |
| `node --version`, `npm --version` | Node v20.20.0 / npm 10.8.2 |
| `npm ls --depth=0`, `npm --prefix server ls --depth=0` | Оба exit 0; прямые зависимости разрешаются в текущем дереве |
| `npm run lint` | Exit 1: **8 errors, 1 warning**. PizzaCard:39 unused index; Sort:4 component/constants export; SearchBar:13/:19 unused vars, :28/:29 hook warning/error; Cart:137 unused arg; Home:93 setState in effect; vite.config:15 no-undef |
| `./server/node_modules/.bin/tsc --noEmit -p server/tsconfig.json` | Exit 1: **TS2345, server/src/index.ts:52**, items array не соответствует object. Emit отключён |
| `npm --prefix server start` | Exit 1: MODULE_NOT_FOUND для server/index.ts; сервер не запустился |
| `npm test -- --no-cache --configLoader runner` | Exit 1 ещё при загрузке config: __dirname is not defined. Runner выбран, чтобы избежать bundle config temp files |
| Vitest через programmatic API, runner loader, cache:false и временный globalThis.__dirname | Config загружен; **0 tests**, одна failed suite: No test suite found в пустом сartSlice.test.ts. envFile:false, файлы не менялись |
| Vite programmatic build с реальным config, runner loader, envFile:false, build.write:false и временным globalThis.__dirname | Exit 0, 189 modules transformed, сборка в памяти. dist не записывался. Это не обычный `npm run build` и не проверка production environment |
| Direct schema probes | Нормальная cart item как request отклонена; order с items array отклонён; ошибочно вложенный order принят; whitespace customer принят |
| Direct route-handler probes | Empty body → 400; malformed customer/items:[null] → 201; negative quantity + unknown pizza → 201; cart-shaped item → 201; unauthenticated GET вернул 3 probe orders; echo вернул переданный объект |
| Direct cart reducer/selectors probes | Два варианта разделены; quantity 3 / total 1700; minus до нуля и remove корректны. Invalid JSON безопасно → пустая корзина; `{}` и `{items:null}` → TypeError |

Метод in-memory checks: прочитан настоящий TS source, транспилирован установленным esbuild **в память**, экспортированные schemas/reducer или зарегистрированные route handlers вызваны на синтетических объектах. Для routes использован минимальный Express registration stub; listen не запускался. Это проверяет handler branches, **не** Express middleware, HTTP serialization, CORS, реальную сеть или БД. Вызовы мутировали только временный массив отдельного процесса; реальные заказы не читались и не создавались.

Programmatic Vite/Vitest probes временно задавали `globalThis.__dirname=process.cwd()` только внутри процесса, поскольку ESM runner не предоставляет __dirname. Source config не исправлялся. Обычный bundled loader может вести себя иначе; runner failure нельзя объявлять доказательством поломки стандартного production build. Предварительная build-проба без project config не разрешила alias `@`; это ошибка неполного audit harness, а не отдельный defect приложения. Повторная проба с реальным config прошла.

Не выполнялись стандартный disk-emitting `npm run build`, frontend configured typecheck (его нет), backend build (нет script), HTTP integration, browser/mobile/keyboard QA, DB connection/migrations, fresh production install, deployment или security audit зависимостей. Причины: audit-only ограничение записи, отсутствующая реализация/конфигурация либо отсутствие необходимости обращаться к внешним системам. Содержимое .env не выводилось и не использовалось для in-memory build; live каталог не проверялся. Нет оснований объявлять полную работоспособность UI/API или готовность deployment.

## I. Seven-Day Engineering Plan

План ниже — **будущие tickets, не выполненная работа**. Цель: небольшой магазин с persisted catalog/orders, базовым login, доступом только к своим заказам и явно демонстрационным payment flow. Одна валюта, фиксированный seed catalog, без реальных платежей, email/SMS и сложной доставки.

Оценка: ориентировочно **50–70 часов сосредоточенной работы**, с существенным риском превышения для первого backend/SQL/auth проекта. Доступных часов пользователя аудит не установил; 7 календарных дней не гарантируют такой объём. Если есть только 2–3 часа в день, весь заявленный scope на 21 октября нереалистичен: нужен уменьшенный demo scope или перенос части требований. Тесты добавляются вместе с поведением каждый день, а не только в конце.

Critical path: contracts/validation → DB catalog + variants → persistent order transaction → identity/owner access → frontend checkout/history → mock payment → integrated QA. Одна новая инфраструктурная технология — PostgreSQL через уже установленный pg. Полный перевод всего frontend на TS, ORM migration и смена UI architecture не входят в неделю.

### День 1 — четверг, 15 октября: contracts и надёжная validation boundary

**T1. Order DTO и validation (M, 4–6 ч).** Разделить Customer / OrderItemRequest / CreateOrderRequest / Order response; выбрать variantId/quantity и representation денег/id; подключить safeParse реального body. Временно допустим in-memory repository, явно помеченный как промежуточный. Не изобретать подтверждённую цену без каталога. Убрать публичную выдачу PII до дальнейшей работы.

**T2. Минимальные quality gates (S–M, 2–3 ч).** Исправить server typecheck/start strategy, test config и первые validation tests; объявить серверную runtime dependency Zod при подключении схем. Подготовить app для import без listen, если нужно для тестов. Не тратить день на переписывание всех компонентов.

Dependencies: нет, это старт. Acceptance: backend tsc noEmit зелёный; валидный request проходит контракт, invalid customer/empty items/negative or fractional quantity/неправильный item shape получают предсказуемый JSON 400 и ничего не сохраняют; request.items больше не содержит orders. Публичный unauthenticated GET не возвращает customer data. Цена из клиента не считается trusted.

### День 2 — пятница, 16 октября: PostgreSQL и каталог

**T3. DB bootstrap + migrations/seed (L, 4–6 ч).** Реализовать environment validation, Pool, воспроизводимые SQL migrations и небольшой seed products/variants. Зафиксировать supported Node/runtime и безопасный пример env names. Проверить clean DB setup. Не встраивать credentials в код.

**T4. Products API + адаптация каталога (M, 3–4 ч).** GET products с allowlisted sort, validated page/limit, search/category, total. Выдать варианты с серверной identity/price; обновить frontend DTO/adapter и карту цены, не переписывая всю UI структуру.

Dependencies: T1. Acceptance: данные берутся из PostgreSQL и сохраняются после restart; каталог SPA загружается с собственного API; response shape согласован; query parameterized, sort allowlisted, пагинация считает total. Несуществующая/неактивная комбинация не является покупаемым вариантом.

### День 3 — суббота, 17 октября: persistent orders и server-side pricing

**T5. Order transaction (L, 5–7 ч).** Orders/order_items migrations, UUID/DB uniqueness, snapshots, total/currency/timestamps/status. В одном transaction читать variants и сохранять order/items; service получает будущий user context, identity клиента не доверяется.

**T6. Негативные интеграционные проверки (M, 2–3 ч).** Unknown/inactive variant, invalid limits, rollback, подмена client price, DB error. Реальные тестовые DB fixtures отделить от пользовательских данных.

Dependencies: T3/T4. Acceptance: заказ и позиции переживают server restart; total вычислен по DB; неверный variant не создаёт ни order, ни частичных items; ошибка БД возвращает безопасный JSON. Пока auth не готова, использовать только локальный закрытый dev/test flow, без публичного order listing.

### День 4 — воскресенье, 18 октября: authentication и ownership

**T7. Минимальная auth (L, 5–7 ч).** Users, надёжный password hashing через поддерживаемую библиотеку, login/logout/me, server-side sessions в PostgreSQL, expiry и HttpOnly cookie. Для production Secure cookie/HTTPS; SameSite/CSRF policy согласовать с deployment topology. Session обновлять при login, инвалидировать при logout. Login rate limit.

**T8. Owner authorization (M, 2–3 ч).** POST orders берёт userId из session; GET list/detail возвращает только свои records. Frontend login и session restore минимальны. Регистрация email/password желательна, но при отставании допустимы заранее seeded **демонстрационные** accounts с полноценным login; это не публичный signup MVP.

Dependencies: T3/T5. Acceptance: неправильные credentials не создают session; private routes дают 401 без неё; пользователь A не читает/не оплачивает order B; logout отзывает доступ. Не хранить password/session token в localStorage, не возвращать password_hash в JSON.

### День 5 — понедельник, 19 октября: checkout UI и история

**T9. End-to-end checkout integration (L, 5–7 ч).** Form customer name/phone/address, field errors, mapping cart → variantId/quantity, submit state, server errors и order confirmation. Настроить same-origin proxy либо явную cross-origin credentials policy. Сохранять cart при ошибке; очистить только после подтверждённого создания и показать server total.

**T10. Простая история (M, 2–3 ч).** Список своих заказов и detail/status, загрузка после refresh. Закрыть cart restore, search clear и pagination bugs, влияющие на основной путь.

Dependencies: T4/T5/T7/T8. Acceptance: браузерный сценарий login → catalog → два варианта → cart → checkout → persisted order → history проходит; после refresh виден тот же заказ. Нет вечного pending, повторный submit блокируется; сетевой сбой не теряет корзину. Keyboard controls/labels формы работают.

### День 6 — вторник, 20 октября: mock payments и security/error integration

**T11. Mock payment (M–L, 3–5 ч).** Явно обозначенный demo flow success/decline для своего order. Server управляет permitted transitions: pending → paid_mock или declined; повторный success не выполняет повторную оплату, повторная ошибка не откатывает paid order. Не запрашивать реальные card details, не менять status произвольным client payload.

**T12. Essential regression/security tests (M, 3–4 ч).** Проверить ownership, pricing, transactions, mock transition repeat, invalid JSON/body limits, error envelope, cart persistence. Добавить request logging без customer PII/password/cookie bodies, базовые headers и rate/body/business limits. Погасить lint errors, отдельный typecheck охватывает хотя бы typed application boundary.

Dependencies: T8/T9/T10. Acceptance: success/decline/retry отображаются в history; чужой payment запрещён; ошибки не раскрывают stack/SQL/secrets; основные автоматические проверки зелёные. Mock не называется реальным processing.

### День 7 — среда, 21 октября: stabilization, documentation, deployment по возможности

**T13. Release candidate (M–L, 5–8 ч).** Один automated E2E полного пути + ручные mobile/keyboard/back-forward/reload/error проверки. Проверить fresh setup, env template, migration/seed/build/start. README: команды обоих пакетов, схема данных, API, ограничения mock/auth, demo instructions, самостоятельные решения. Настроить небольшой CI lint/typecheck/tests/build. Production build/start использовать выбранную Node версию; liveness отделить от DB readiness.

Deployment — только после validation/authorization/privacy gates: frontend SPA fallback, API origin, HTTPS cookies, persistent DB, migrations. Если hosting затягивается, локально воспроизводимый MVP + README остаются результатом, deployment явно помечается незавершённым. До реальных клиентов нужны отдельные задачи backups/restore, мониторинг и эксплуатационные проверки.

Dependencies: все core tickets. Acceptance: сценарий воспроизводится после restart с чистой установки по README; smoke tests зелёные; список известных ограничений честный; исходные credentials не публикуются; новые данные persistent. Нельзя закрывать задачу «prod-ready» только потому, что Vite build зелёный.

### Что сокращать при отставании

1. Сначала отложить redesign, admin dashboard/CRUD каталога, promo codes, отзывы, delivery scheduling, real payments, social login, refresh-token complexity, AI features, Docker и сложный hosting setup.
2. Регистрацию можно заменить seeded demo accounts + настоящий login/authorization. История — одна простая страница, mock payment — один небольшой контрол с двумя исходами. Это сокращение функциональности должно быть явно отражено в README.
3. Если к концу 17 октября ещё нет DB-priced persistent order, не пытаться параллельно добавить всю identity/payment систему. Зафиксировать core demo: catalog → guest checkout → persisted confirmation; не публиковать общий orders endpoint. Authentication/history/mock остаются незавершёнными требованиями full scope, их нельзя молча объявить выполненными.
4. Не сокращать server validation, DB integrity/price calculation, защиту customer data и тесты критичных branches ради дополнительных экранов. Если на них нет времени, сдвинуть release или ограничиться локальным demo.

Stretch goals после core: DB-backed idempotency key для order creation, public signup если был отложен, OpenAPI, order operator UI с отдельными правами, CI deployment, дополнительные E2E, расширенная accessibility QA. Полноценная миграция всего frontend на TS — отдельная задача, не prerequisite недельного заказа.

## J. Definition of Done

Ниже — checklist **целевого full-scope MVP**, а не текущее состояние.

- [ ] Проект запускается по README на выбранной Node версии; root/server dependencies и env names документированы, secrets отсутствуют в repo.
- [ ] PostgreSQL создаётся воспроизводимыми migrations/seed; products/variants/users/sessions/orders/items persistent.
- [ ] Каталог загружается из собственного API, корректно работают filter/sort/search/pagination и реальные total/page count.
- [ ] Variant identity одинакова в DB/API/cart; цены и размеры имеют согласованные типы; несовместимый JSON не роняет UI.
- [ ] Корзина различает варианты, считает quantity/total и безопасно восстанавливается даже после повреждения localStorage.
- [ ] Checkout form показывает field errors; route реально выполняет Zod validation и business validation; negative/fractional/too-large quantities и неизвестные variants отклоняются.
- [ ] Сервер определяет цены/итоги из БД; order + items создаются атомарно; snapshots сохраняют историю цены.
- [ ] Login/logout/me работают; passwords hashed; sessions защищены и persistent; есть minimal login UI. Signup либо реализован, либо demo-only limitation явно объявлена.
- [ ] Order list/detail/payment доступны только owner; userId и payment status из request не считаются trusted.
- [ ] Mock payment явно назван mock, поддерживает success/decline, безопасные повторные переходы; реальные деньги/card details не используются.
- [ ] Пользователь видит server order ID/total/status и собственную историю после refresh/restart; cart не теряется при failed submit.
- [ ] Согласованы JSON errors, invalid JSON handling, body/business limits, rate limits, безопасные headers и logs; нет публичного debug echo с customer data.
- [ ] Зелёные lint, backend typecheck, тесты и production build; frontend typed boundaries проверяются отдельным typecheck, а не только Vite transpilation.
- [ ] Автотесты покрывают request validation, pricing/unknown variant, rollback, ownership, payment repeats, cart variants/storage; один E2E покрывает полный путь.
- [ ] Основной сценарий проверен на мобильном viewport и клавиатурой; виден focus, controls/inputs имеют labels и semantic buttons.
- [ ] README описывает current scope, команды, DB setup, API и известные ограничения; CI выполняет необходимые проверки.
- [ ] Если выполнен deployment: HTTPS, cookies/origins, SPA fallback, DB persistence и smoke checks подтверждены. Если нет — это явно записано, hosting не считается завершённым.

MVP допускает отсутствие production observability/backups SLA и реальных payments. Для реального использования нужны отдельные acceptance criteria, включая backup restore и обработку персональных данных; текущий checklist не является сертификатом production readiness.

## K. Engineering Mentor Handoff

### Что уже сделано и не нужно делать заново

Frontend имеет routes, catalog UI, category/sort/search controls, thunk с abort signal, loading/error/empty/retry, variant-aware cart, selectors, localStorage и responsive styles. Удаление последней единицы варианта реализовано. Бессмысленный прежний zero-count branch в plusItem уже убран (`cartSlice.ts:66`); не переносить старые замечания из сентябрьского аудита автоматически.

Backend теперь содержит работающие по handler logic POST orders, GET orders и echo checkout; прежняя пустая checkout/test handler уже отвечает JSON (`index.ts:19`). Есть Zod schemas, pg dependency и strict TS config. **Но schemas не используются routes, DB не подключена, UI checkout/auth/payment нет.** Установка инструмента не равна реализации функциональности.

Не считать, что frontend подключён к Express: единственный GET идёт на VITE_API_URL. Не считать, что Order schema соответствует CartItems. Не считать `orders: Order[]` runtime validation; TypeScript уже сигнализирует о разрыве. Не считать успешную in-memory сборку доказательством type safety, correct API или deployment.

### Как работать с автором проекта

Автор хочет **сам писать код**. Mentor выдаёт один ограниченный engineering ticket, объясняет цель/ограничения и acceptance criteria, затем рассматривает реализацию автора. Не выдавать полный готовый backend, SQL layer или форму по умолчанию. Подсказки — по реальному затруднению, без чрезмерного пошагового раскрытия решения.

Объяснять доступным русским с корректными English terms. Использовать конкретные примеры там, где они проясняют contract, transaction, authorization или failure case. Не заменять engineering практику trivial quizzes о синтаксисе/tooling. Темы обучения: доверие к данным на границах, SQL constraints и transactions, DTO vs persistence model, HTTP contracts, sessions/ownership, тестирование и trade-offs modular monolith.

Сохранять существующие компоненты и incremental подход. Не начинать с полного FSD refactor, смены Redux, перехода на новый framework, ORM или переписывания всего на TS. Проверять поведение, а не только наличие новых файлов. Перед новым этапом читать изменения после этого snapshot, чтобы не повторять выполненную работу.

### Формат mentor ticket/review

Ticket: problem → scope → non-goals → expected behavior/contract → acceptance checks. Review: blockers/risks с file:line, воспроизводимый пример, причина и направление исправления; затем коротко что уже сделано правильно. Не считать механическую замену типов исправлением runtime bug. Все HTTP/DB claims подкреплять реальными тестами, отдельно отмечать непроверенное.

Ключевые вопросы для совместного решения перед DB migration: variantId representation, currency/minor units, request item limits, signup vs seeded demo login, same-origin deployment topology. Эти решения ещё не приняты автором; предложенные варианты этого документа — рекомендации, а не действующая спецификация.

## L. Immediate Next Task

**T1: исправить контракт создания заказа и включить фактическую runtime validation в POST /api/orders.** Это одна цель: сделать границу HTTP request → validated DTO понятной, типобезопасной и проверяемой до PostgreSQL интеграции.

Почему следующая именно она: текущий tsc падает из-за items shape, схемы описывают не те данные и handler принимает мусор. Перенос этой структуры в SQL или подключение формы сейчас закрепят ошибочный контракт сразу в трёх местах.

Scope: `server/src/types.ts` и POST route в `server/src/index.ts`, нужные tests/bootstrap и объявление runtime dependency по необходимости. Отдельные schemas для request item/create request/order response; согласовать variant identity и quantity. Проверять **parsed data**, а не продолжать читать unchecked req.body после успешной проверки. In-memory storage пока можно оставить как временный слой. DB pricing и checkout UI — последующие tickets; нельзя утверждать, что они появятся от подключения Zod.

Acceptance criteria:

1. Request schema содержит customer и массив **позиций**, без вложенных order id/customer на каждом item; Order response содержит массив order items.
2. Маршрут действительно вызывает safeParse/parse и использует validated result; неверные типы, whitespace-only обязательные поля, empty array, negative/fractional quantity отклоняются до изменения storage.
3. Ответ validation error имеет один JSON envelope с понятными field paths; valid DTO и invalid DTO покрыты настоящими тестами.
4. `./server/node_modules/.bin/tsc --noEmit -p server/tsconfig.json` проходит без ослабления strict, `any` casts или подгонки Order type под произвольный req.body.
5. Server schemas разрешают зависимости при isolated install согласно manifest; факт type-only импорта не маскирует будущую runtime dependency.
6. Price/total/status/userId клиента не становятся trusted; существование variant и денежный расчёт явно оставлены следующему catalog/DB service ticket.

Mentor должен дать автору этот ticket и review его реализацию. **Во время данного аудита roadmap не реализовывался.**
