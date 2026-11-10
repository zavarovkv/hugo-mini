+++
title = "Wide code contracts"
type = "blog"
hidden = true
wideCode = true
+++

Code near the recent-posts rail must leave those links in place.

```python {linenos=inline}
message = "A deliberately long line that requires horizontal scrolling beside the rail, and still exceeds the 960 pixel cap below it."
```

<div style="height:900px" aria-hidden="true"></div>

The same long example below the rail can expand.

```python {linenos=inline}
message = "A deliberately long line that requires horizontal scrolling beside the rail, and still exceeds the 960 pixel cap below it."
```

Short examples keep the text width.

```python
print("short")
```

Table line numbers retain their scrolling container.

```python {linenos=table}
message = "A deliberately long line that requires horizontal scrolling beside the rail, and still exceeds the 960 pixel cap below it."
```

Nested examples stay inside their parent.

> ```python
> message = "A deliberately long line that requires horizontal scrolling beside the rail, and still exceeds the 960 pixel cap below it."
> ```
