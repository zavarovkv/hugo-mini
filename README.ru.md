# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

**Минималистичная тема Hugo для личных блогов, статей и заметок.**

Собирается с помощью Hugo. Основные шрифты, стили и скрипты загружаются с вашего сайта.

**[Демо](https://hugo-mini-demo.vercel.app/)** · **[Быстрый старт](#быстрый-старт)** · **[Каталог тем Hugo](https://themes.gohugo.io/themes/hugo-mini/)** · **[Документация](#документация)**

[![Hugo Mini — темная тема в браузере и светлая на iPhone, на прозрачном фоне](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v8.gif)](https://hugo-mini-demo.vercel.app/)

В тему входит **Inter**. В демо используются Стори, Сурдин и Мирта с отдельными лицензиями. [Подробнее о шрифтах](docs/demo.md#deployment-owned-demo-fonts).

## Возможности

- **Типографика для чтения.** [Beauty.css](https://github.com/zavarovkv/beauty-css), цитаты, сноски, заметки на полях и верстка для печати. [Посмотреть примеры](docs/typography.ru.md).
- **Полнотекстовый поиск.** [Pagefind](docs/search.md) собирает индекс вместе с сайтом: фрагменты статей, управление с клавиатуры и выдача на текущем языке.
- **Удобная навигация.** Мобильное меню, светлая и темная темы, клавиатурные сочетания. Поддержка нескольких языков; русский и английский интерфейсы уже включены.
- **Все для статей.** Подсветка и копирование кода, формулы KaTeX, диаграммы Mermaid и широкие изображения.
- **Все для публикации.** SEO-метаданные, автоматические изображения для соцсетей, RSS, JSON Feed и карта сайта.
- **Больше, чем блог.** Блоки главной страницы, избранные статьи, проекты, список книг и [резюме для печати](docs/resume.md).
- **Свой стиль.** Настраиваемые цвета, шрифты и логотип. Комментарии Telegram, кнопки «Поделиться» и аналитика подключаются по желанию.

## Быстрый старт

Нужны **[Hugo Extended 0.146+](https://gohugo.io/installation/)** и **Git**. Готовый шаблон с поиском также требует **Node.js 22.12+**; сайты без поиска можно собирать только Hugo.

Создайте блог с примерами главной страницы, страницы об авторе и первой статьи:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
cp themes/hugo-mini/starter/hugo.toml hugo.toml
cp -R themes/hugo-mini/starter/content/. content/
cp themes/hugo-mini/starter/package*.json .
npm ci
npm run dev
```

Откройте `http://localhost:1313/`. Укажите название блога и автора в `hugo.toml`, замените примеры страниц в `content/`.

Остановите сервер сочетанием `Ctrl+C`, затем создайте статью и включите просмотр черновиков:

```bash
hugo new content blog/my-first-post.md
npm run dev -- --buildDrafts
```

Для публикации остановите сервер, задайте свой `baseURL`, измените `draft` статьи на `false`, выполните `npm run build` и загрузите `public/` на статический хостинг. [Инструкция по публикации](docs/deployment.md).

**Предпочитаете Vercel?** Разверните [готовый шаблон](starter/README.md) в своем репозитории:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

Уже есть сайт или используете Hugo Modules? Смотрите [установку](docs/configuration.md#installation). Для следующих версий есть [инструкция по обновлению](docs/configuration.md#updating).

## Документация

[Все руководства](docs/README.md) · [Указатель возможностей](docs/advanced-features.md)

- [Настройки и языки](docs/configuration.md) · [Пример сайта](exampleSite/)
- [Статьи и компоненты](docs/content.md) · [Типографика](docs/typography.ru.md)
- [Настройка темы](docs/customization.md) · [Шрифты](docs/fonts.md) · [Telegram](docs/telegram.md)
- [Ресурсы темы](docs/vendor-assets.md) · [История изменений](CHANGELOG.md)

[Сообщить об ошибке](https://github.com/zavarovkv/hugo-mini/issues) · [Участвовать в разработке](CONTRIBUTING.md)

## Лицензия

[MIT](LICENSE)
