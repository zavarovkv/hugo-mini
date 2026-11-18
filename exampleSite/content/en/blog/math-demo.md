+++
title = "Math Formulas with KaTeX"
slug = "math-demo"
date = "2026-03-15T12:00:00+00:00"
description = "Rendering mathematical notation with KaTeX — inline and block formulas"
categories = ["getting-started"]
math = true
+++

The formulas below are written in Markdown using TeX. Mini serves [KaTeX](https://katex.org/) from the site on pages with `math = true`.

## Inline Math

Wrap expressions in single dollar signs for inline rendering. For example, Euler's identity $e^{i\pi} + 1 = 0$ is often called the most beautiful equation in mathematics. The quadratic formula $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ solves any second-degree polynomial.

## Block Math

Use double dollar signs for display-mode equations centered on their own line.

The Gaussian integral:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Bayes' theorem:

$$
P(A \mid B) = \frac{P(B \mid A) \cdot P(A)}{P(B)}
$$

A matrix:

$$
\mathbf{A} = \begin{pmatrix} a_{11} & a_{12} & a_{13} \\ a_{21} & a_{22} & a_{23} \\ a_{31} & a_{32} & a_{33} \end{pmatrix}
$$

## Mixing Math and Text

KaTeX works alongside regular Markdown. You can reference variables like $n$, $k$, or $\alpha$ inline and follow up with a block formula:

$$
\binom{n}{k} = \frac{n!}{k!(n-k)!}
$$

## Sums and Products

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

$$
\prod_{i=1}^{n} i = n!
$$

## Front Matter

```toml
+++
title = "My Post with Math"
math = true
+++
```

Enable [Goldmark passthrough](https://github.com/zavarovkv/hugo-mini/blob/main/docs/media.md#formulas) in the site configuration to preserve subscripts and matrix row breaks. The demo already includes this setting.
