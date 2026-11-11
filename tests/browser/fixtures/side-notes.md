+++
title = 'Side notes'
type = 'blog'
hidden = true
sideNotes = true
+++

This first paragraph has two neighboring references[^one][^two]. A repeated reference must keep pointing to the same note[^one].

The next paragraph keeps the reading column unchanged. The illustration may use the free space to its right.

{{< image src="/browser-wide.svg" alt="Wide illustration" width=1200 height=800 wide=true >}}

A final reference checks a long note close to the end of the article[^three].

## Notes

[^one]: A short source with a [link](https://example.org/).
[^two]: This explanation is deliberately long enough to meet its neighboring note. It must move down instead of overlapping it. The illustration still uses its wide container; any intersecting note follows the illustration. The original note, number and return link remain the same.
[^three]: A long final note must reserve enough space before the page footer. This text repeats the condition with several sentences so it wraps through many lines in the narrow margin. Each paragraph and return link must remain accessible at all widths.

    A second paragraph also belongs to this note. A long final note must reserve enough space before the page footer. This text repeats the condition with several sentences so it wraps through many lines in the narrow margin. Each paragraph and return link must remain accessible at all widths.

    A third paragraph checks the note's full height. A long final note must reserve enough space before the page footer. This text repeats the condition with several sentences so it wraps through many lines in the narrow margin. Each paragraph and return link must remain accessible at all widths.
