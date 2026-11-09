+++
title = "Browser contracts"
mermaid = true
+++

## Wide table

A statement with a source[^first], a quotation[^quote], code[^code] and a list[^list].

[^first]: A paragraph with a return link.
[^quote]: > A note starting with a quotation.
[^code]:
    ```text
    source()
    ```
[^list]: - A note starting with a list.

| Identifier | Started | Finished | Reference | Description |
| :--- | ---: | ---: | :--- | :--- |
| `a_very_long_unbroken_identifier_123456789` | 2026-11-01 | 2026-11-09 | `another_long_reference_123456789` | All columns remain readable. |
| `second_unbroken_identifier_123456789` | 2026-11-02 | 2026-11-10 | `reference_with_no_spaces_123456789` | Last cell marker. |

## Diagram one

{{< mermaid >}}
flowchart LR
  A[Research] e1@--> B[Build]
  e1@{ animate: true }
  B --> C@{ shape: cyl, label: "Data" }
{{< /mermaid >}}

<div style="height:1600px" aria-hidden="true"></div>

## Diagram two

{{< mermaid >}}
sequenceDiagram
  Alice->>Bob: Review
  Bob-->>Alice: Approved
{{< /mermaid >}}
