import { Fragment } from "react";

/**
 * The message formatting the original documented in its "How to Chat" modal: `*text*`
 * or `_text_` for italic, `**text**` for bold, `***text***` for both, and a blank line
 * for a paragraph break.
 *
 * The original ran the *input* through snarkdown and stored the resulting HTML, then
 * rendered it with `v-html`. That is stored XSS — snarkdown passes raw tags through, so
 * anything a sender typed became live markup in the recipient's page. This formats at
 * render time into React elements instead, so a message is never markup no matter what
 * it contains, and the same four rules the modal describes still work.
 */
export function formatMessage(text: string) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {formatInline(line)}
    </Fragment>
  ));
}

// Longest delimiter first: *** has to be matched before ** and *, or the shorter rule
// consumes the opening of the longer one.
const INLINE = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;

function formatInline(line: string) {
  return line.split(INLINE).map((part, index) => {
    if (part.startsWith("***") && part.endsWith("***")) {
      return (
        <strong key={index}>
          <em>{part.slice(3, -3)}</em>
        </strong>
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    if (part.startsWith("_") && part.endsWith("_")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}
