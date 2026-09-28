# Notes

## Known limitation

The filings endpoint currently uses the `filings.recent` data returned by the SEC submissions endpoint.

For companies with longer filing histories, the SEC may reference additional historical submission files through `filings.files`. These files are not currently fetched.

With more time, I would fetch those referenced files, normalize them using the same filing formatter, merge them with the recent filings, and apply filtering, sorting, and pagination to the combined result.

> [!IMPORTANT]
> Fixes for full filing history, caching, and related SEC data handling are available on the [`full-history-fix`](https://github.com/JonathanVarild/Quartr-Coding-Task/tree/full-history-fix) branch.

## Further improvements

- Cache company submissions to avoid fetching the same SEC submissions document multiple times during one frontend search.
