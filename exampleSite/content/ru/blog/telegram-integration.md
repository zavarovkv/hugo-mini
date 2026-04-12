+++
title = "Интеграция с Telegram"
slug = "telegram-integration"
date = "2026-04-05T12:00:00+00:00"
description = "Комментарии Discussion и живые счетчики реакций — две Telegram-фичи темы"
categories = ["getting-started"]
+++

Mini относится к Telegram как к first-class инструменту engagement'а для блогов, чья аудитория частично живет в мессенджере. Две независимых фичи работают поверх одной и той же связки `telegramChannel` + `telegram_post`:

1. Комментарии через официальный виджет Telegram Discussion
2. Живые счетчики реакций и просмотров рядом с датой поста

Каждая фича рендерится только при наличии своего конфига — можно включать по одной.

## Комментарии Discussion

Задай username канала (без `@`) в `config.toml`:

```toml
[params]
  telegramChannel = "your_channel"
```

Пометь каждый пост ID сообщения в канале:

```toml
+++
title = "Мой пост"
telegram_post = 42
+++
```

Mini встраивает официальный виджет Telegram Discussion Comments, который ленится — подгружается только когда секция попадает в viewport (через `IntersectionObserver`). Виджет синхронизируется с theme-toggle: при клике на переключатель темы пересобирается и переключается между light/dark.

## Реакции и просмотры

Тема включает zero-dependency Node-скрипт, который парсит публичные embed'ы Telegram для каждого поста и пишет счетчики реакций + просмотров в `data/telegram_reactions.json`. Два partial'а (`telegram-views.html` и `telegram-reactions.html`) читают эти данные и рендерят inline-ряд рядом с датой поста:

```
👁 857   28 августа 2024                           ⭐ 11   ❤ 7
```

Иконка глаза + число просмотров слева, реакции выровнены справа через flexbox. На мобиле две группы стекаются вертикально. Глаз — filled монохромный SVG из двух path + круглый зрачок, позаимствован из блога Ильи Бирмана, рисуется через `currentColor` так что наследует цвет окружающего текста.

### Как это работает

1. Для каждого поста с `telegram_post = NNN` скрипт делает fetch на `https://t.me/<channel>/<id>?embed=1` — публичный URL, auth не нужен
2. Парсит встроенный HTML на `<span class="tgme_reaction">` и `.tgme_widget_message_views`
3. Пишет один JSON-файл, который Hugo грузит как `site.Data.telegram_reactions`
4. Partial'ы темы ищут ID текущего поста в этом map'е и рендерят ряд — либо ничего, если данных нет

Paid-реакции звездами (`⭐`) сохраняются. Custom premium-эмодзи без текстового fallback'а пропускаются. Счетчики просмотров сохраняют форматирование Telegram (`1.2K`, `857`).

### Установка

В `package.json` сайта:

```json
"scripts": {
  "fetch-telegram-reactions": "node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs"
}
```

В `.gitignore` — сгенерированный файл, не нужно версионировать, он пересчитывается на каждом билде:

```
/data/telegram_reactions.json
```

Вызов скрипта в CI перед `hugo --minify`:

```yaml
- name: Fetch Telegram reactions
  continue-on-error: true
  run: npm run fetch-telegram-reactions
- name: Build
  run: hugo --minify
```

`continue-on-error: true` — важный момент: если Telegram недоступен, деплой все равно пройдет, а partial'ы отрендерят пустоту вместо того чтобы сломать сборку.

### Автоматическое определение и override'ы

Скрипт авто-резолвит channel и content directory через `hugo config --format json`. В обычном случае флаги не нужны. Для переопределения:

```bash
node themes/hugo-mini/scripts/fetch-telegram-reactions.mjs \
  --channel my_channel \
  --content-dir content/en/posts \
  --output data/tg.json
```

Также учитывает env var `TELEGRAM_CHANNEL`.

### Graceful degradation

Partial'ы ничего не рендерят если:

- Data-файла нет (локальная разработка без запуска fetch-скрипта)
- У поста нет `telegram_post` во front matter
- Запись для этого ID отсутствует (пост удален из канала, fetch упал, etc.)

Это значит что `hugo server` локально работает без запуска fetch-скрипта — сайт просто не покажет счетчики. Так же и при первом клонировании репозитория.

## Полная настройка

Чтобы включить обе фичи, добавь в `config.toml`:

```toml
[params]
  telegramChannel = "your_channel"
```

Затем в front matter каждого поста которому соответствует Telegram-сообщение:

```toml
+++
title = "Мой пост"
telegram_post = 42
+++
```

И wire fetch-скрипт в `package.json` + CI как показано выше.

Готово — виджет комментариев и счетчики реакций включаются на каждом посте у которого задан `telegram_post`. Убери поле из front matter — виджет комментариев и ряд с реакциями исчезают именно для этого поста.
