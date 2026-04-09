+++
title = "Диаграммы с Mermaid"
slug = "mermaid-demo"
date = "2026-02-01T12:00:00+00:00"
description = "Блок-схемы, диаграммы последовательности и другие диаграммы на Mermaid"
categories = ["getting-started"]
mermaid = true
+++

Mini поддерживает диаграммы через [Mermaid](https://mermaid.js.org/) — JavaScript-библиотеку для рендеринга диаграмм из текстовых описаний. Как и KaTeX, Mermaid загружается только на страницах, где это нужно.

Включите диаграммы для страницы с помощью `mermaid = true` в front matter, затем используйте шорткод `{{</* mermaid */>}}`.

## Блок-схема

{{< mermaid >}}
graph TD
    A[Написать контент] --> B{Нужны диаграммы?}
    B -->|Да| C[Добавить mermaid = true]
    C --> D[Использовать шорткод mermaid]
    D --> E[Hugo рендерит]
    B -->|Нет| E
    E --> F[Опубликовать]
{{< /mermaid >}}

## Диаграмма последовательности

{{< mermaid >}}
sequenceDiagram
    participant U as Пользователь
    participant B as Браузер
    participant S as Hugo Server

    U->>B: Открыть страницу
    B->>S: GET /blog/
    S->>B: HTML + CSS
    B->>U: Отрендеренная страница
    U->>B: Переключить тему
    B->>B: Обновить тему
{{< /mermaid >}}

## Диаграмма Ганта

{{< mermaid >}}
gantt
    title Таймлайн настройки блога
    dateFormat  YYYY-MM-DD
    section Настройка
    Установить Hugo      :done, 2026-01-01, 1d
    Выбрать тему         :done, 2026-01-02, 1d
    section Контент
    Написать первый пост :done, 2026-01-03, 3d
    Добавить i18n        :active, 2026-01-06, 2d
    section Запуск
    Деплой               :2026-01-08, 1d
{{< /mermaid >}}

## Круговая диаграмма

{{< mermaid >}}
pie title Что делает тему для блога хорошей
    "Типографика" : 35
    "Скорость" : 25
    "Простота" : 25
    "Возможности" : 15
{{< /mermaid >}}

## Front Matter

```toml
+++
title = "Мой пост с диаграммами"
mermaid = true
+++
```

Диаграммы Mermaid автоматически адаптируют цвета к текущей теме — светлой или темной.
