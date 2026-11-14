# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

**Минималистичная тема Hugo для личных блогов.** Меньше настроек — больше времени на тексты.

Типографика на основе [Beauty.css](https://github.com/zavarovkv/beauty-css). Для сборки нужен Hugo; Node.js и внешние сервисы не обязательны.

**[Демо](https://hugo-mini-demo.vercel.app/)** · **[Быстрый старт](#быстрый-старт)** · **[Каталог тем Hugo](https://themes.gohugo.io/themes/hugo-mini/)** · **[Документация](#документация)**

В тему входит Inter. Лицензированные Стори, Сурдин и Мирта из демо не включены. [Подробнее о шрифтах](docs/deployment.md#deployment-owned-demo-fonts).

[![Hugo Mini — компьютерная и мобильная версии со звездочкой, навигацией и светлым и темным оформлением](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v5.gif)](https://hugo-mini-demo.vercel.app/)

## Почему Mini

- **Удобно читать.** Адаптивный текст, цитаты, сноски и верстка для печати. [Примеры типографики](docs/typography.ru.md).
- **Все для публикации.** Мобильное меню, темная тема, несколько языков, SEO, RSS и JSON Feed.
- **Больше, чем статьи.** [Избранные статьи](docs/content.md#featured-articles), проекты, список книг и [резюме для печати](docs/content.md#standalone-resume).
- **Интеграции по желанию.** Формулы, диаграммы, комментарии Telegram, кнопки «Поделиться» и аналитика.
- **Свой стиль.** Настраиваемые цвета, шрифты и логотип; для H2 в статьях можно [выбрать шрифт H1](docs/fonts.md#use-the-title-face-for-article-h2). Основные ресурсы загружаются с вашего сайта.

## Быстрый старт

**Разверните блог на Vercel в один клик:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

[Файлы шаблона](starter/) · [Инструкция](starter/README.md)

**Запустите локально** с Hugo Extended версии 0.146 или новее:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Замените содержимое `hugo.toml` на:

```toml
baseURL = "https://example.com/"
title = "My Blog"
theme = "hugo-mini"

[[menu.main]]
  name = "Blog"
  url = "/blog/"
  weight = 1
```

Создайте первую статью и запустите сервер:

```bash
hugo new content blog/_index.md
hugo new content blog/hello-world.md
hugo server -D
```

Откройте `http://localhost:1313/`. Смотрите [пример сайта](exampleSite/) и [установку через Hugo Modules](docs/configuration.md#installation).

## Документация

Все функции и настройки: [обзор возможностей](docs/advanced-features.md).

- [Установка и языки](docs/configuration.md) · [Публикация сайта](docs/deployment.md)
- [Статьи и компоненты](docs/content.md) · [Типографика](docs/typography.ru.md)
- [Настройка темы](docs/customization.md) · [Шрифты](docs/fonts.md) · [Telegram](docs/telegram.md)
- [Ресурсы темы](docs/vendor-assets.md) · [История изменений](CHANGELOG.md)

[Сообщить об ошибке](https://github.com/zavarovkv/hugo-mini/issues) · [Участвовать в разработке](CONTRIBUTING.md) · [Поставить звезду на GitHub](https://github.com/zavarovkv/hugo-mini)

## Лицензия

[MIT](LICENSE)
