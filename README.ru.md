# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

Минималистичная тема Hugo для быстрых многоязычных персональных блогов, в которых главное — текст.

Аккуратная типографика, локальные ресурсы, темная тема, SEO и необязательная интеграция с Telegram — без фронтенд-фреймворка.

За типографику отвечает [Beauty.css](https://github.com/zavarovkv/beauty-css): библиотека зафиксирована на конкретной версии и включена в сборку вместе со стилями темы. Устанавливать ее отдельно не нужно.

**[Демо](https://hugo-mini-demo.vercel.app/)** · **[Быстрый старт](#быстрый-старт)** · **[Каталог тем Hugo](https://themes.gohugo.io/themes/hugo-mini/)** · **[Документация](#документация)**

[![Hugo Mini — десктопная и мобильная версии со светлой и темной темами](images/readme-preview-v4.gif)](https://hugo-mini-demo.vercel.app/)

## Почему Mini

- **Для чтения.** Интерфейс не отвлекает от текста и оставляет статьям достаточно пространства.
- **Быстрая по умолчанию.** CSS, JavaScript и шрифты собираются в компактные файлы с хешами и загружаются с вашего домена.
- **Все необходимое без набора плагинов.** Темная тема, многоязычная навигация, ленты, SEO-метаданные, формулы, диаграммы и кнопки для публикации ссылок уже включены.
- **Легко расширять.** Дизайн-токены, хуки шаблонов, именованные блоки и собственные иконки меню покрывают большинство типовых задач.

Mini подходит для персональных сайтов и блогов, в которых главное — статьи, а не журнальные обложки или интерфейсы приложений.

## Быстрый старт

**Готовый блог на Vercel в один клик** — создаст новый репозиторий с редактируемым блогом и автоматически опубликует сайт:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzavarovkv%2Fhugo-mini%2Ftree%2Fmain%2Fstarter&project-name=my-mini-blog&repository-name=my-mini-blog)

[Посмотреть файлы шаблона](starter/) · [Как устроена установка в один клик](starter/README.md)

**Или установите локально**, используя Hugo Extended 0.146 или новее:

```bash
hugo new site myblog
cd myblog
git init
git submodule add https://github.com/zavarovkv/hugo-mini.git themes/hugo-mini
```

Замените `hugo.toml` минимальной конфигурацией:

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

Создайте раздел блога и первую статью:

```bash
hugo new content blog/_index.md
hugo new content blog/hello-world.md
hugo server -D
```

Откройте `http://localhost:1313/`. Готовый пример можно посмотреть в [exampleSite](exampleSite/). Предпочитаете Hugo Modules? Изучите [варианты установки](docs/configuration.md#installation).

## Что входит в тему

| Раздел | Возможности |
| --- | --- |
| Публикации | Markdown, типографика при сборке, необязательные ссылки на заголовки и CSS-классы, копирование кода, подписи, KaTeX, Mermaid |
| Чтение | Адаптивная ширина текста до 720 px, темная тема с учетом настроек системы, стили для печати, последние и закрепленные статьи |
| SEO и ленты | Изображения Open Graph, JSON-LD, `hreflang`, RSS, JSON Feed, `llms.txt` |
| Интеграции | Комментарии и реакции Telegram, кнопки для публикации ссылок, необязательная аналитика |

Подробнее — в разделах про [компоненты контента и дополнительные возможности](docs/advanced-features.md). Функции, увеличивающие размер страницы, подключаются по необходимости: KaTeX и Mermaid загружаются только для нужных статей, аналитика и Telegram отключены до настройки.

Без JavaScript мобильная навигация остается доступной в виде обычных ссылок. При включенном JavaScript меню изначально скрыто без мерцания и закрывается по Escape, выбору ссылки или выходу фокуса за его пределы. Открытие и закрытие меню сохраняет положение статьи на странице.

Кнопка поиска отображается по умолчанию: круглая иконка справа в навигации на компьютере и текстовый пункт «Поиск» перед последним элементом мобильного меню. Пока поиск не реализован, обе ссылки ведут на главную страницу. Чтобы скрыть кнопку, установите `showSearchButton = false` в `[params]`.

Диаграммы Mermaid появляются по мере приближения к области просмотра. Если JavaScript отключен или загрузка не удалась, исходный код диаграммы остается доступным. Локальная ESM-сборка загружается по необходимости, а хеш в адресе файла обновляет браузерный кеш после изменений. Подробнее — в [конфигурации](docs/configuration.md). Для локальных изображений в Markdown автоматически проставляются размеры, чтобы страница не прыгала при загрузке.

## Чтение и типографика

Размер текста статьи — 16 px, максимальная ширина строки — 720 px. Встроенная Beauty.css отвечает за оформление текста, а Hugo при сборке учитывает особенности пробелов в русском и английском языках. Исходные файлы Markdown не меняются, JavaScript для переписывания текста в браузере не нужен. Чтобы отключить обработку, задайте `typography = false`. Примеры и тонкие настройки — в [руководстве по типографике](docs/typography.md).

## Основные настройки

Большинству сайтов достаточно нескольких параметров:

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

В статьях используется TOML front matter:

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

`hidden = true` исключает страницу из списков и лент, но оставляет ее доступной по прямому адресу. Hugo-параметр `draft = true` не дает опубликовать черновик. Если известен только месяц публикации, используйте `date_precision = "month"`. Подробности о видимости, канонических адресах, категориях, датах и печати — в [руководстве по контенту](docs/content.md).

Когда позволяет ширина экрана, последние статьи показываются рядом с публикацией; на узких экранах — под ней. `recentSidebarCount = 0` скрывает этот список. Параметр `backToTop = false` отключает кнопку возврата наверх для страницы или всего сайта. Все настройки собраны в [конфигурации](docs/configuration.md), а оформление карточек для соцсетей, собственные шапки, ссылки в футере и другие расширения описаны в [кастомизации](docs/customization.md).

По умолчанию выбор темы и языка сохраняется локально. Чтобы делиться этими настройками между сайтом и его поддоменами, используйте [общие настройки темы и языка](docs/configuration.md#shared-theme-and-language-preferences).

## Необязательные интеграции

- **Многоязычность:** отдельные меню для языков, переводы интерфейса, `hreflang`, переключатель в футере для двух языков или выпадающее меню для трех и более, а также внутренние Markdown-ссылки на доступные переводы. `localizeLinks = false` сохраняет исходные адреса ссылок.
- **Telegram:** комментарии с отложенной загрузкой, счетчики просмотров и реакций, обновляемые при сборке.
- **Формулы и диаграммы:** KaTeX и Mermaid включаются отдельно для каждой страницы.
- **Аналитика:** Яндекс Метрика, Google Analytics, Plausible и Umami; по умолчанию все отключены.
- **Кастомизация:** цветовые токены, собственные SVG-иконки меню, хуки partial-шаблонов и именованные блоки.

## Документация

Подробные руководства пока доступны на английском языке:

- [Настройка и многоязычность](docs/configuration.md)
- [Написание и организация контента](docs/content.md)
- [Компоненты контента и дополнительные возможности](docs/advanced-features.md)
- [Готовый шаблон Vercel](starter/)
- [Ширина текста и типографика при сборке](docs/typography.md)
- [Кастомизация темы](docs/customization.md)
- [Комментарии и реакции Telegram](docs/telegram.md)
- [Публикация сайта](docs/deployment.md)
- [Обновление встроенных зависимостей](docs/vendor-assets.md)
- [История изменений](CHANGELOG.md) · [Участие в разработке](CONTRIBUTING.md)

Нашли ошибку или хотите предложить улучшение? [Создайте issue](https://github.com/zavarovkv/hugo-mini/issues).
Если Mini помогает вам публиковать тексты, [звезда на GitHub](https://github.com/zavarovkv/hugo-mini) поможет другим авторам найти тему.

## Лицензия

[MIT](LICENSE)
