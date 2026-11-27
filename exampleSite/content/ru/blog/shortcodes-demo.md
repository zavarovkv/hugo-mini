+++
title = "Шорткоды и HTML-элементы"
slug = "shortcodes-demo"
date = "2026-01-15T12:00:00+00:00"
description = "Встроенные шорткоды и стилизованные HTML-элементы в теме Mini"
categories = ["getting-started"]
wideCode = true
reading_list = "books"
+++

Mini включает шорткоды и CSS-классы для контента, который выходит за рамки стандартного Markdown.

## Подборки статей

Шорткод `featured-posts` знакомит читателей с избранными статьями в заданном порядке.
Укажите пути контента в `hugo.toml`: один список использует заголовки и ссылки текущего языка.

```toml
[params]
featuredPosts = ["/blog/theme-features", "/blog/under-the-hood", "/blog/hello-world"]
```

Добавьте шорткод в файл главной страницы `_index.md`:

```text
{{</* featured-posts archive="/blog/" archiveLabel="Все статьи" */>}}
```

{{< featured-posts archive="/blog/" archiveLabel="Все статьи" >}}

Для последних статей по дате используйте `latest-posts count="3"`.
Оба шорткода поддерживают одинаковую необязательную ссылку на все статьи.

## Колонки

`columns` ставит блоки друг под другом на телефоне и рядом при ширине больше `48rem`.
`ratio="3:2"` задает пропорцию 60/40, `ratio="2:3"` — 40/60; без параметра колонки равны:

{{< columns ratio="3:2" >}}
{{< column >}}
{{< latest-posts count="2" >}}
{{< /column >}}
{{< column >}}
### Проекты {.posts-group-title .no-anchor}
{{< project name="Hugo Mini" url="https://themes.gohugo.io/themes/hugo-mini/" icon="images/hugo-mini-logo-light.svg" iconDark="images/hugo-mini-logo-dark.svg" >}}
Тема, на которой работает это демо. {{< github-stars repo="zavarovkv/hugo-mini" >}}
{{< /project >}}
{{< /column >}}
{{< /columns >}}

<details><summary>Как выглядит счетчик во время загрузки</summary>
<p>Пока значение неизвестно, индикатор занимает место будущего числа. Ниже показан пример этого состояния.</p>
<p aria-hidden="true">Просмотры <span class="loading-skeleton" aria-busy="true"><span>000</span></span></p>
</details>

## Книжная полка

Шорткод `reading-list` собирает полку на обоих языках из одного файла данных.

{{< reading-list >}}

## Широкие изображения

С параметром `wide=true` широкая иллюстрация выходит за оба края текстовой колонки поровну. Ее ширина ограничена исходным размером и 960 px.
Подпись набирается курсивом по центру под изображением.
На телефоне и при печати используется обычная ширина. Размеры локальных растровых изображений
определяются автоматически; для SVG и внешних изображений нужны явные `width` и `height`.

```text
{{</* image src="../../images/wide-chart.svg" alt="Пример линейного графика" width=1200 height=600 wide=true caption="Широкая иллюстрация с подписью в пределах текстовой колонки." */>}}
```

{{< image src="../../images/wide-chart.svg" alt="Пример линейного графика" width=1200 height=600 wide=true caption="Широкая иллюстрация с подписью в пределах текстовой колонки." >}}

## Caption

Шорткод `caption` добавляет пояснение к изображению — меньшим размером, прямым начертанием, с выравниванием по началу строки. Используйте после изображений или блоков кода:

```markdown
![Фото](/path/to/image.png)
{{</* caption */>}}Рисунок 1 — описание изображения{{</* /caption */>}}
```

{{< caption >}}Рисунок 1 — разместите изображение над этой подписью{{< /caption >}}

Для короткого указания автора или источника добавьте `kind="credit"`: подпись станет приглушенной, курсивной и выровненной по концу строки:

```markdown
{{</* caption kind="credit" */>}}Фото автора{{</* /caption */>}}
```

{{< caption kind="credit" >}}Фото автора{{< /caption >}}

## Plug (Разделитель секций)

Шорткод `plug` вставляет декоративный разделитель «* * *» — удобно для разделения секций в длинном посте:

```markdown
{{</* plug */>}}
```

{{< plug >}}

## Выносные цитаты

Используйте шорткод `callout` для блочных цитат. Внутри работает Markdown. В демо включен `editorialQuotes = true`, поэтому Markdown-цитаты и callout используют общее оформление:

```markdown
{{</* callout */>}}Текст вашей цитаты.{{</* /callout */>}}
```

{{< callout >}}Хорошая тема для блога должна быть невидимой. Читатель должен видеть контент, а не дизайн.{{< /callout >}}

## Underline

CSS-класс `.beauty-emphasis` создает волнистое подчеркивание средствами CSS — подходит для выделения ключевых фраз:

```html
<span class="beauty-emphasis">выделенный текст</span>
```

<span class="beauty-emphasis">Этот текст имеет декоративное подчеркивание</span> — хорошо работает для акцента, который заметнее курсива, но мягче жирного.

## Button

CSS-класс `.button` создает стилизованную кнопку призыва к действию с градиентным фоном:

```html
<a href="../blog/" class="button beauty-button">Читать статьи</a>
```

<a href="../blog/" class="button beauty-button">Читать статьи</a>

## Комбинирование элементов

Markdown {{< wavy-arrow label="преобразуется в" >}} HTML

<span class="beauty-emphasis">Для авторов</span> — Mini не усложняет. Пишите в Markdown, добавляйте флаги в front matter для формул или диаграмм при необходимости, а тема позаботится об остальном.

{{< plug >}}

<figure class="beauty-quotation">
  <blockquote>
    <p><span class="beauty-hanging-open">«</span>Простота — высшая форма изощренности».</p>
  </blockquote>
  <figcaption class="beauty-quotation-attribution">
    <span aria-hidden="true">—</span>
    <span>Приписывается Леонардо да Винчи</span>
  </figcaption>
</figure>
