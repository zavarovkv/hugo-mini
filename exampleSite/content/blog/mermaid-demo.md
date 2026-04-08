+++
title = "Mermaid Diagrams"
slug = "mermaid-demo"
date = "2026-02-01T12:00:00+00:00"
description = "Demonstrating Mermaid diagram support in Mini theme"
categories = ["getting-started"]
mermaid = true
+++

Mini supports diagrams via Mermaid. Enable it per-page with `mermaid = true` in front matter.

## Flowchart

{{< mermaid >}}
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
{{< /mermaid >}}

## Sequence Diagram

{{< mermaid >}}
sequenceDiagram
    User->>Blog: Read post
    Blog->>User: Return content
    User->>Blog: Subscribe
{{< /mermaid >}}
