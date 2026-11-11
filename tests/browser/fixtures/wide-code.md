+++
title = "Wide code contracts"
type = "blog"
hidden = true
wideCode = true
+++

Long code blocks use the available space to the right.

```python {linenos=inline}
message = "A deliberately long line that overflows the reading column and still requires horizontal scrolling beyond the 960 pixel cap."
```

A later long example follows the same width constraints.

```python {linenos=inline}
message = "A deliberately long line that overflows the reading column and still requires horizontal scrolling beyond the 960 pixel cap."
```

Short examples keep the text width.

```python
print("short")
```

Table line numbers retain their scrolling container.

```python {linenos=table}
message = "A deliberately long line that overflows the reading column and still requires horizontal scrolling beyond the 960 pixel cap."
```

Nested examples stay inside their parent.

> ```python
> message = "A deliberately long line that overflows the reading column and still requires horizontal scrolling beyond the 960 pixel cap."
> ```
