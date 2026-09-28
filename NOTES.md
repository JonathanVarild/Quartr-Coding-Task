# Notes

## SEC data handling

The filings endpoints combine `filings.recent` from the main SEC submissions response with every historical submissions file referenced by `filings.files`.

The merged, unformatted filing history is cached in memory by CIK for one hour. Concurrent requests for an uncached company share the same in-flight promise.

Outgoing SEC requests are limited to nine per second. Additional requests wait for the next one-second window.
