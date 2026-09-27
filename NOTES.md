# Notes

## Known limitation

The filings endpoint currently uses the `filings.recent` data returned by the SEC submissions endpoint.

For companies with longer filing histories, the SEC may reference additional historical submission files through `filings.files`. These files are not currently fetched.

With more time, I would fetch those referenced files, normalize them using the same filing formatter, merge them with the recent filings, and apply filtering, sorting, and pagination to the combined result.

## Further improvements

- Cache company submissions to avoid fetching the same SEC submissions document multiple times during one frontend search.
