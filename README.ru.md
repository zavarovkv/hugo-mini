# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

Минималистичная тема Hugo для личного блога, в котором главное — текст.

Аккуратная типографика на основе [Beauty.css](https://github.com/zavarovkv/beauty-css), светлая и темная темы, несколько языков и SEO. Все основные файлы загружаются с вашего сайта. Для сборки нужен только Hugo, без Node.js.

**[Демо](https://hugo-mini-demo.vercel.app/)** · **[Быстрый старт](#быстрый-старт)** · **[Каталог тем Hugo](https://themes.gohugo.io/themes/hugo-mini/)** · **[Документация](#документация)**

[![Hugo Mini — компьютерная и мобильная версии в светлом и темном оформлении](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v4.gif)](https://hugo-mini-demo.vercel.app/)

## Возможности

- **Для чтения.** Аккуратная типографика, колонка текста до 720 px и адаптивная верстка.
- **Быстрая загрузка.** Стили, скрипты и шрифты включены в тему и загружаются с вашего сайта.
- **Готово к публикации.** Несколько языков, SEO, RSS, JSON Feed и кнопки «Поделиться».
- **По желанию.** Формулы, диаграммы, комментарии Telegram и аналитика.
- **Простая настройка.** Цвета, меню и шаблоны можно менять без правки кода темы.

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

**Поиск:** кнопка в меню пока ведет на главную страницу. Чтобы ее скрыть, установите `showSearchButton = false` в `[params]`.

## Документация

Подробные руководства пока доступны на английском:

- **Начало работы:** [Настройка и языки](docs/configuration.md), [Публикация сайта](docs/deployment.md), [Шаблон Vercel](starter/).
- **Статьи:** [Контент](docs/content.md), [Типографика](docs/typography.md), [Дополнительные возможности](docs/advanced-features.md).
- **Оформление:** [Настройка темы](docs/customization.md), [Telegram](docs/telegram.md), [Встроенные библиотеки](docs/vendor-assets.md).
- **Проект:** [История изменений](CHANGELOG.md), [Участие в разработке](CONTRIBUTING.md).

[Сообщить об ошибке](https://github.com/zavarovkv/hugo-mini/issues) · [Поставить звезду на GitHub](https://github.com/zavarovkv/hugo-mini)

## Лицензия

[MIT](LICENSE)
