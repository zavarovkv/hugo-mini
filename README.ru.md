# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

Лёгкая тема Hugo для личного блога, в котором главное — текст.

Продуманная типографика, тёмная тема, несколько языков, SEO и необязательные комментарии Telegram. Для сборки сайта достаточно Hugo — без фронтенд-фреймворков и Node.js.

В основе оформления текста — [Beauty.css](https://github.com/zavarovkv/beauty-css). Проверенная версия библиотеки уже включена в тему, устанавливать что-либо дополнительно не нужно.

**[Демо](https://hugo-mini-demo.vercel.app/)** · **[Быстрый старт](#быстрый-старт)** · **[Каталог тем Hugo](https://themes.gohugo.io/themes/hugo-mini/)** · **[Документация](#документация)**

[![Hugo Mini — компьютерная и мобильная версии в светлом и тёмном оформлении](images/readme-preview-v4.gif)](https://hugo-mini-demo.vercel.app/)

## Почему Mini

- **Ничего лишнего.** Спокойное оформление помогает сосредоточиться на статье.
- **Быстрая загрузка без сложной настройки.** Стили, скрипты и шрифты загружаются с вашего домена и эффективно кешируются.
- **Всё необходимое уже есть.** Тёмная тема, несколько языков, ленты публикаций, SEO, формулы, диаграммы и кнопки «Поделиться».
- **Гибкая настройка.** Цвета, меню и шаблоны можно менять через настройки и расширения, не переписывая саму тему.

Mini создана для личных сайтов и блогов, где важен текст, а не журнальные макеты или интерфейсы веб-приложений.

## Быстрый старт

**Запустите блог на Vercel в один клик.** Шаблон создаст репозиторий с вашим сайтом и сразу опубликует его:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

[Файлы шаблона](starter/) · [Как работает запуск в один клик](starter/README.md)

**Или запустите сайт на своём компьютере.** Понадобится Hugo Extended версии 0.146 или новее:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Замените содержимое `hugo.toml` следующей минимальной конфигурацией:

```toml
baseURL = "https://example.com/"
title = "My Blog"
theme = "hugo-mini"
enableRobotsTXT = true

[permalinks]
  blog = "/:slug/"

[params]
  authorName = "Jane Doe"
  authorURL = "https://example.com/"

[markup.goldmark.renderer]
  unsafe = true

[[menu.main]]
  name = "Articles"
  url = "/blog/"
  weight = 1
```

Создайте раздел блога и первую публикацию:

```bash
hugo new content blog/_index.md
hugo new content blog/hello-world.md
hugo server -D
```

Откройте `http://localhost:1313/`. Пример готового сайта находится в [exampleSite](exampleSite/). Также можно подключить тему через Hugo Modules — см. [варианты установки](docs/configuration.md#installation).

## Что входит в тему

| Раздел | Возможности |
| --- | --- |
| Публикации | Markdown, обработка типографики при сборке, необязательные ссылки на заголовки и CSS-классы, копирование кода, подписи, KaTeX, Mermaid |
| Чтение | Удобная ширина текста до 720 px, тёмная тема с учётом настроек устройства, оформление для печати, последние и закреплённые статьи |
| SEO и ленты | Изображения Open Graph, JSON-LD, `hreflang`, RSS, JSON Feed, `llms.txt` |
| Интеграции | Комментарии и реакции Telegram, кнопки «Поделиться», подключаемая аналитика |

Подробнее — в [руководстве по дополнительным возможностям](docs/advanced-features.md). KaTeX и Mermaid загружаются только на страницах, где они нужны. Аналитика и интеграция с Telegram не включаются, пока вы их не настроите.

Мобильное меню работает и без JavaScript: ссылки остаются доступными. С JavaScript меню не мелькает при загрузке, закрывается по Escape, после перехода по ссылке или при выходе фокуса за пределы меню. При открытии и закрытии страница не прокручивается сама собой.

Кнопка «Поиск» показывается по умолчанию. На компьютере это иконка справа в верхнем меню, на телефоне — текстовый пункт в раскрывающемся меню. **Сам поиск пока не реализован:** обе кнопки ведут на главную страницу. Скрыть их можно параметром `showSearchButton = false` в `[params]`.

Диаграммы Mermaid загружаются по мере прокрутки страницы. Если JavaScript отключён или диаграмма не загрузилась, её исходный код останется видимым. Нужные модули подгружаются по запросу, а при обновлении файлов меняется их адрес, чтобы браузер не использовал устаревшую версию. Подробнее — в [настройках](docs/configuration.md). Для локальных изображений Hugo заранее определяет размеры, поэтому текст не сдвигается во время загрузки.

## Чтение и типографика

Основной текст набирается шрифтом 16 px, а ширина колонки ограничена 720 px. За внешний вид отвечает Beauty.css. При сборке Hugo также расставляет пробелы с учётом правил русского и английского языков. Исходные Markdown-файлы остаются нетронутыми, а браузеру не приходится исправлять текст с помощью JavaScript. При необходимости эту обработку можно отключить параметром `typography = false`. Подробности и примеры — в [руководстве по типографике](docs/typography.md).

## Основные настройки

Для начала достаточно нескольких параметров:

```toml
[params]
  favicon = "images/favicon.png"
  avatar = "images/avatar.webp"
  avatarHover = "images/avatar-hover.webp"
  copyrightYear = 2024
  recentSidebarCount = 8
  socialSharing = true

  [params.social]
    telegram = "https://t.me/janedoe"
    github = "https://github.com/janedoe"
    email = "jane@example.com"
```

Метаданные статьи задаются в начале Markdown-файла в формате TOML:

```toml
+++
title = "My first post"
date = 2026-08-17
description = "A short summary for listings and search results."
categories = ["notes"]
pinned = false
math = false
mermaid = false
+++
```

`hidden = true` убирает статью из списков и лент, но не закрывает доступ по прямой ссылке. `draft = true` оставляет её в черновиках и не публикует на сайте. Если известен только месяц публикации, используйте `date_precision = "month"`. Все параметры видимости, дат, категорий и канонических ссылок описаны в [руководстве по публикациям](docs/content.md).

На широком экране последние публикации появляются рядом со статьёй, а на узком — под ней. Чтобы убрать этот список, установите `recentSidebarCount = 0`. Кнопку возврата к началу страницы можно отключить через `backToTop = false` для отдельной статьи или всего сайта. Полный список параметров есть в [руководстве по настройке](docs/configuration.md), а карточки для соцсетей, собственные элементы шапки и футера и другие изменения — в [руководстве по оформлению](docs/customization.md).

Выбор языка и светлого или тёмного оформления по умолчанию запоминается отдельно для каждого сайта. При необходимости эти предпочтения можно [синхронизировать между основным доменом и поддоменами](docs/configuration.md#shared-theme-and-language-preferences).

## Необязательные интеграции

- **Несколько языков:** собственное меню для каждого языка, переводы интерфейса и `hreflang`. Если языков два, переключатель показывается в футере; если больше — в выпадающем меню. Внутренние Markdown-ссылки могут автоматически вести на перевод страницы. Параметр `localizeLinks = false` отключает эту замену.
- **Telegram:** комментарии загружаются по мере необходимости, а счётчики просмотров и реакций обновляются во время сборки сайта.
- **Формулы и диаграммы:** KaTeX и Mermaid можно включать только там, где они нужны.
- **Аналитика:** Яндекс Метрика, Google Analytics, Plausible и Umami. Все счётчики по умолчанию отключены.
- **Своё оформление:** цвета, SVG-иконки меню, дополнительные элементы шаблонов и переопределяемые блоки.

## Документация

Подробные руководства пока написаны на английском:

- [Настройка темы и несколько языков](docs/configuration.md)
- [Подготовка и публикация статей](docs/content.md)
- [Дополнительные возможности и оформление контента](docs/advanced-features.md)
- [Шаблон для запуска на Vercel](starter/)
- [Типографика и ширина текстовой колонки](docs/typography.md)
- [Изменение внешнего вида темы](docs/customization.md)
- [Комментарии и реакции Telegram](docs/telegram.md)
- [Публикация сайта](docs/deployment.md)
- [Обновление библиотек, включённых в тему](docs/vendor-assets.md)
- [История изменений](CHANGELOG.md) · [Как помочь проекту](CONTRIBUTING.md)

Нашли ошибку или придумали улучшение? [Расскажите об этом на GitHub](https://github.com/zavarovkv/hugo-mini/issues).
Если вам нравится Mini, [поставьте звезду на GitHub](https://github.com/zavarovkv/hugo-mini). Так другим авторам будет проще найти тему.

## Лицензия

[MIT](LICENSE)
