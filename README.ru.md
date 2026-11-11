# Hugo Mini

[![Release](https://img.shields.io/github/v/release/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/releases)
[![Build](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml/badge.svg)](https://github.com/zavarovkv/hugo-mini/actions/workflows/test-example-site.yml)
[![License](https://img.shields.io/github/license/zavarovkv/hugo-mini)](https://github.com/zavarovkv/hugo-mini/blob/main/LICENSE)

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

**Минималистичная тема Hugo для личных блогов.** Меньше настроек — больше времени на тексты.

Аккуратная типографика на основе [Beauty.css](https://github.com/zavarovkv/beauty-css), удобное чтение на любом экране, светлое и темное оформление. Несколько языков, SEO, RSS и JSON Feed доступны сразу. Для сборки нужен только Hugo: без Node.js и обязательных внешних сервисов.

**[Демо](https://hugo-mini-demo.vercel.app/)** · **[Быстрый старт](#быстрый-старт)** · **[Каталог тем Hugo](https://themes.gohugo.io/themes/hugo-mini/)** · **[Документация](#документация)**

[![Hugo Mini — компьютерная и мобильная версии со звездочкой, навигацией и светлым и темным оформлением](https://raw.githubusercontent.com/zavarovkv/hugo-mini/main/images/readme-preview-v5.gif)](https://hugo-mini-demo.vercel.app/)

## Почему Mini

- **Цитаты:** `editorialQuotes` включает общее оформление Markdown-цитат во всех языках; отзывы используют более крупный текст, подписи выровнены справа. `beauty-lead` выделяет авторские определения и тезисы увеличенным основным шрифтом.
- **Текст на первом месте.** Стабильная колонка до 720 px на компьютере, удобный для телефона текст 19 px, широкий режим изображений, схем и длинных блоков кода по выбору автора, аккуратные заголовки, подписи и сноски, с примечаниями на полях компьютера и открытием ссылок из статей в новой вкладке по выбору автора. Буквицы по выбору автора, вынос кавычек, особые цифры в абзацах и явные дроби добавляют точности в деталях. Автоматическая правка пунктуации сохраняет Markdown; для печати статей предусмотрена отдельная верстка. [Типографика и примеры](docs/typography.ru.md). По желанию клик по H1/H2 и Option/Alt + ↑/↓ перемещают по заголовкам с якорем в URL, без дополнительных значков.
- **Ничего лишнего.** Адаптивная верстка с удобной для нажатия кнопкой мобильного меню; шрифты, стили, скрипты и иконки загружаются с вашего сайта. В профиле шрифтов сайта можно сочетать отдельные гарнитуры H1 и цитат с основным текстом и настроить насыщенность текста и компонентов. При обновлении локальных иконок их адреса меняются автоматически.
- **Все для публикации.** Светлая и темная темы, плавное выделение разделов в меню и легкая анимация стрелок проектов и архива, фавиконка, несколько языков, SEO, RSS и JSON Feed.
- **Только нужные функции.** Настройка цветов, меню и логотипа; формулы, диаграммы, комментарии Telegram, кнопки «Поделиться» и аналитика — по желанию.

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

Начните с [полного обзора возможностей](docs/advanced-features.md): чтение и печать, навигация, компоненты контента, интеграции и расширение темы.

- [Установка и языки](docs/configuration.md) · [Публикация сайта](docs/deployment.md) · [Написание статей](docs/content.md)
- [Типографика](docs/typography.ru.md) · [Шрифты сайта](docs/fonts.md) · [Настройка темы](docs/customization.md)
- [Горячие клавиши статей](docs/content.md#article-keyboard-navigation) · [Telegram](docs/telegram.md)
- [Ресурсы темы](docs/vendor-assets.md) · [История изменений](CHANGELOG.md)

[Сообщить об ошибке](https://github.com/zavarovkv/hugo-mini/issues) · [Участвовать в разработке](CONTRIBUTING.md) · [Поставить звезду на GitHub](https://github.com/zavarovkv/hugo-mini)

## Лицензия

[MIT](LICENSE)
