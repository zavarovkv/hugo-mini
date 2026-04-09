+++
title = "Diagrams with Mermaid"
slug = "mermaid-demo"
date = "2026-02-01T12:00:00+00:00"
description = "Creating flowcharts, sequence diagrams, and more with Mermaid"
categories = ["getting-started"]
mermaid = true
+++

Mini supports diagrams via [Mermaid](https://mermaid.js.org/) — a JavaScript library for rendering diagrams from text definitions. Like KaTeX, Mermaid is only loaded on pages that need it.

Enable diagrams per-page with `mermaid = true` in front matter, then use the `{{</* mermaid */>}}` shortcode.

## Flowchart

{{< mermaid >}}
graph TD
    A[Write content] --> B{Need diagrams?}
    B -->|Yes| C[Add mermaid = true]
    C --> D[Use mermaid shortcode]
    D --> E[Hugo renders it]
    B -->|No| E
    E --> F[Publish]
{{< /mermaid >}}

## Sequence Diagram

{{< mermaid >}}
sequenceDiagram
    participant U as User
    participant B as Browser
    participant S as Hugo Server

    U->>B: Open page
    B->>S: GET /blog/
    S->>B: HTML + CSS
    B->>U: Rendered page
    U->>B: Toggle dark mode
    B->>B: Update theme
{{< /mermaid >}}

## Gantt Chart

{{< mermaid >}}
gantt
    title Blog Setup Timeline
    dateFormat  YYYY-MM-DD
    section Setup
    Install Hugo        :done, 2026-01-01, 1d
    Choose theme        :done, 2026-01-02, 1d
    section Content
    Write first post    :done, 2026-01-03, 3d
    Add i18n            :active, 2026-01-06, 2d
    section Launch
    Deploy              :2026-01-08, 1d
{{< /mermaid >}}

## Pie Chart

{{< mermaid >}}
pie title What Makes a Good Blog Theme
    "Typography" : 35
    "Speed" : 25
    "Simplicity" : 25
    "Features" : 15
{{< /mermaid >}}

## Front Matter

```toml
+++
title = "My Post with Diagrams"
mermaid = true
+++
```

Mermaid diagrams automatically adapt their colors to the current theme — light or dark.
